import { createHash } from 'node:crypto';
import type { Database } from 'better-sqlite3';

export interface ColumnDef {
  name: string;
  type: string;
  notNull?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  unique?: boolean;
  default?: string;
  check?: string;
  references?: string;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
}

export const SCHEMA: TableDef[] = [
  {
    name: 'entries',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'slug', type: 'TEXT', notNull: true, unique: true },
      { name: 'title', type: 'TEXT', notNull: true, default: "''" },
      { name: 'author_note', type: 'TEXT', notNull: true, default: "''" },
      { name: 'content', type: 'TEXT', notNull: true, default: "''" },
      { name: 'last_edited', type: 'TEXT', notNull: true, default: "''" },
      { name: 'release_date', type: 'TEXT', notNull: true, default: "''" },
      {
        name: 'category',
        type: 'TEXT',
        notNull: true,
        default: "'guide'",
        check: "category IN ('worldbuilding', 'story', 'guide')",
      },
      { name: 'tags', type: 'TEXT', notNull: true, default: "'[]'" },
      { name: 'published', type: 'INTEGER', notNull: true, default: '0' },
      { name: 'created_at', type: 'TEXT', notNull: true, default: "(datetime('now'))" },
    ],
  },
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'username', type: 'TEXT', notNull: true, unique: true },
      { name: 'password_hash', type: 'TEXT', notNull: true, default: "''" },
      { name: 'is_admin', type: 'INTEGER', notNull: true, default: '0' },
      { name: 'created_at', type: 'TEXT', notNull: true, default: "(datetime('now'))" },
    ],
  },
  {
    name: 'sessions',
    columns: [
      { name: 'token', type: 'TEXT', primaryKey: true },
      { name: 'user_id', type: 'INTEGER', notNull: true, references: 'users(id) ON DELETE CASCADE' },
      { name: 'expires_at', type: 'INTEGER', notNull: true, default: '0' },
    ],
  },
];

const META_TABLE = 'meta';
const SCHEMA_KEY = 'schema_hash';

function schemaHash(): string {
  return createHash('sha256').update(JSON.stringify(SCHEMA)).digest('hex').slice(0, 16);
}

function columnSql(col: ColumnDef, full: boolean): string {
  const parts = [`"${col.name}" ${col.type}`];
  if (full) {
    if (col.primaryKey) parts.push(`PRIMARY KEY${col.autoIncrement ? ' AUTOINCREMENT' : ''}`);
    if (col.unique) parts.push('UNIQUE');
  }
  if (col.notNull) parts.push('NOT NULL');
  if (col.default !== undefined) parts.push(`DEFAULT ${col.default}`);
  if (col.check) parts.push(`CHECK (${col.check})`);
  if (col.references) parts.push(`REFERENCES ${col.references}`);
  return parts.join(' ');
}

function tableSql(def: TableDef, name: string): string {
  return `"${name}" (${def.columns.map((c) => columnSql(c, true)).join(', ')})`;
}

function canAlterAdd(col: ColumnDef): boolean {
  if (col.primaryKey || col.autoIncrement || col.unique || col.check || col.references) return false;
  if (!col.notNull) return true;
  const d = col.default;
  if (!d || d.startsWith('(')) return false;
  if (/^[a-z_][a-z0-9_]*\s*\(/i.test(d)) return false;
  return true;
}

interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

function getColumns(db: Database, table: string): Map<string, ColumnInfo> {
  const rows = db.prepare(`PRAGMA table_info("${table}")`).all() as unknown as ColumnInfo[];
  return new Map(rows.map((r) => [r.name, r]));
}

function tableExists(db: Database, table: string): boolean {
  return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`).get(table);
}

function rebuildTable(db: Database, def: TableDef): void {
  const current = getColumns(db, def.name);
  const temp = `${def.name}__migrate`;
  const shared = def.columns.filter((c) => current.has(c.name)).map((c) => `"${c.name}"`);

  db.exec(`DROP TABLE IF EXISTS "${temp}"`);
  db.exec(`CREATE TABLE ${tableSql(def, temp)}`);
  if (shared.length > 0) {
    db.exec(
      `INSERT INTO "${temp}" (${shared.join(', ')}) SELECT ${shared.join(', ')} FROM "${def.name}"`
    );
  }
  db.exec(`DROP TABLE "${def.name}"`);
  db.exec(`ALTER TABLE "${temp}" RENAME TO "${def.name}"`);
}

function reconcileTable(db: Database, def: TableDef): void {
  if (!tableExists(db, def.name)) {
    db.exec(`CREATE TABLE ${tableSql(def, def.name)}`);
    return;
  }

  const current = getColumns(db, def.name);
  const targetNames = new Set(def.columns.map((c) => c.name));

  const missing = def.columns.filter((c) => !current.has(c.name));
  if (missing.some((c) => !canAlterAdd(c))) {
    rebuildTable(db, def);
    return;
  }
  for (const col of missing) {
    db.exec(`ALTER TABLE "${def.name}" ADD COLUMN ${columnSql(col, false)}`);
  }

  const extra = [...current.keys()].filter((n) => !targetNames.has(n));
  for (const name of extra) {
    try {
      db.exec(`ALTER TABLE "${def.name}" DROP COLUMN "${name}"`);
    } catch {
      rebuildTable(db, def);
      return;
    }
  }
}

export function migrateSchema(db: Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS ${META_TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);

  const hash = schemaHash();
  const applied = db.prepare(`SELECT value FROM ${META_TABLE} WHERE key = ?`).get(SCHEMA_KEY) as
    | { value: string }
    | undefined;

  if (applied?.value === hash) return;

  db.exec('BEGIN');
  try {
    for (const def of SCHEMA) reconcileTable(db, def);
    db.prepare(`INSERT OR REPLACE INTO ${META_TABLE} (key, value) VALUES (?, ?)`).run(SCHEMA_KEY, hash);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
