#!/usr/bin/env python3

import os
import sqlite3
import time
import fcntl
from pathlib import Path
from datetime import datetime

DB_PATH = Path("/home/ubuntu/enia/data/enia.db")
BACKUP_DIR = Path("/home/ubuntu/enia/backups")
LOCK_PATH = BACKUP_DIR / ".backup.lock"

# ---------------------------------------------------------------------------
# RETENTION POLICY
# ---------------------------------------------------------------------------
#
# Each tuple is:
#
#   (maximum_age, spacing)
#
# Keep approximately one backup every "spacing" within that age range.
#
# Example:
#
#   0 - 1h       -> every 10m
#   1 - 2h       -> every 20m
#   2 - 6h       -> every 1h
#   6 - 12h      -> every 2h
#   12 - 24h     -> every 4h
#   24 - 48h     -> every 8h
#   48 - 96h     -> every 16h
#
RETENTION_TIERS = [
    (1 * 60 * 60,       10 * 60),
    (2 * 60 * 60,       20 * 60),
    (6 * 60 * 60,       60 * 60),
    (12 * 60 * 60,      2 * 60 * 60),
    (24 * 60 * 60,      4 * 60 * 60),
    (48 * 60 * 60,      8 * 60 * 60),
    (96 * 60 * 60,      16 * 60 * 60),
]

def timestamp():
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def backup_progress(status, remaining, total):
    if total:
        completed = total - remaining
        percent = completed * 100 / total

        print(
            f"Backup progress: "
            f"{completed}/{total} pages "
            f"({percent:.1f}%)",
            flush=True,
        )

# ---------------------------------------------------------------------------
# CREATE SQLITE BACKUP
# ---------------------------------------------------------------------------

def create_backup():
    if not DB_PATH.exists():
        raise RuntimeError(
            f"Database does not exist: {DB_PATH}"
        )

    BACKUP_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    filename = f"enia_{timestamp()}.db"

    temporary_path = BACKUP_DIR / f".{filename}.tmp"
    final_path = BACKUP_DIR / filename

    print(f"Creating backup: {final_path}")

    source = sqlite3.connect(
        f"file:{DB_PATH}?mode=ro",
        uri=True,
        timeout=30,
    )

    try:
        destination = sqlite3.connect(
            temporary_path
        )

        try:
            print("Running SQLite online backup...")

            with destination:
                source.backup(
                    destination,
                    pages=100,
                    progress=backup_progress,
                )

            # Verify the resulting database.
            print("Running SQLite integrity check...")

            result = destination.execute(
                "PRAGMA integrity_check"
            ).fetchone()

            if not result or result[0] != "ok":
                raise RuntimeError(
                    f"SQLite integrity check failed: {result}"
                )

        finally:
            destination.close()

    finally:
        source.close()

    # The backup only becomes visible after it is completely finished
    # and has passed the integrity check.
    temporary_path.rename(final_path)

    print(f"Backup completed successfully: {final_path}")

    return final_path

# ---------------------------------------------------------------------------
# FIND BACKUPS
# ---------------------------------------------------------------------------

def get_backups():
    backups = []

    for path in BACKUP_DIR.glob("enia_*.db"):
        try:
            mtime = path.stat().st_mtime

            backups.append({
                "path": path,
                "mtime": mtime,
            })

        except FileNotFoundError:
            pass

    # Oldest first.
    backups.sort(
        key=lambda x: x["mtime"]
    )

    return backups

# ---------------------------------------------------------------------------
# RETENTION
# ---------------------------------------------------------------------------

def cleanup_backups():
    backups = get_backups()

    if not backups:
        return

    now = time.time()

    keep = set()

    # Always keep the newest backup.
    newest = max(
        backups,
        key=lambda x: x["mtime"]
    )

    keep.add(newest["path"])

    #
    # We process the retention tiers from newest -> oldest.
    #
    previous_boundary = 0

    for maximum_age, spacing in RETENTION_TIERS:

        tier_start = previous_boundary
        tier_end = maximum_age

        # Backups belonging to this age range.
        candidates = [
            backup
            for backup in backups
            if (
                tier_start
                <= now - backup["mtime"]
                < tier_end
            )
        ]

        if not candidates:
            previous_boundary = tier_end
            continue

        #
        # Walk backwards through the tier and retain backups
        # approximately "spacing" apart.
        #
        candidates.sort(
            key=lambda x: x["mtime"],
            reverse=True
        )

        last_kept_time = None

        for backup in candidates:

            backup_time = backup["mtime"]

            if last_kept_time is None:
                keep.add(backup["path"])
                last_kept_time = backup_time
                continue

            if last_kept_time - backup_time >= spacing:
                keep.add(backup["path"])
                last_kept_time = backup_time

        previous_boundary = tier_end

    #
    # Anything older than the final retention tier is deleted.
    #
    oldest_allowed_age = RETENTION_TIERS[-1][0]

    deleted = 0

    for backup in backups:

        path = backup["path"]
        age = now - backup["mtime"]

        if age > oldest_allowed_age:
            try:
                path.unlink()

                print(
                    f"Deleted expired backup: {path}"
                )

                deleted += 1

            except FileNotFoundError:
                pass

    #
    # Delete backups inside the retention period that were not
    # selected by the tier algorithm.
    #
    for backup in backups:

        path = backup["path"]
        age = now - backup["mtime"]

        if age <= oldest_allowed_age and path not in keep:

            try:
                path.unlink()

                print(
                    f"Deleted redundant backup: {path}"
                )

                deleted += 1

            except FileNotFoundError:
                pass

    print(
        f"Cleanup complete. "
        f"Kept {len(keep)} backups, "
        f"deleted {deleted}."
    )

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    BACKUP_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    #
    # Prevent two backup processes from running simultaneously.
    #
    with open(LOCK_PATH, "w") as lock:
        try:
            fcntl.flock(
                lock,
                fcntl.LOCK_EX | fcntl.LOCK_NB
            )

        except BlockingIOError:

            print(
                "Another backup is already running. "
                "Exiting."
            )

            return

        create_backup()
        cleanup_backups()

        print("Database backup job finished successfully.")

if __name__ == "__main__":
    main()