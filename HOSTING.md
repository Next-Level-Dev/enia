# Hosting rundown

---

images, videos and sound files are uploaded to cloudflare r2 connected to my 01 gmail, direct file links can then be used in markdown.

connecting to the vps
> ssh ubuntu@130.110.245.214 -i "C:\Users\utq\Desktop\enia\ssh-key-2026-08-16.key"

---

check the webhook service
`systemctl cat webhook.service`
<details>
<summary>output</summary>

~~~bash
[Unit]
Description=GitHub Webhook Listener
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -verbose -port 9000
Restart=on-failure

[Install]
WantedBy=multi-user.target
~~~

</details>

---

check the backup service
`systemctl cat enia-db-backup.service`
/etc/systemd/system/enia-db-backup.service
<details>
<summary>output</summary>

~~~bash
[Unit]
Description=Backup Enia SQLite database
After=local-fs.target

[Service]
Type=oneshot
User=ubuntu
Group=ubuntu

ExecStart=/usr/bin/python3 /home/ubuntu/enia/scripts/backup-db.py

Nice=10
IOSchedulingClass=best-effort
IOSchedulingPriority=7

PrivateTmp=true

[Install]
WantedBy=multi-user.target
~~~

</details>

/etc/systemd/system/enia-db-backup.timer
<>
[Unit]
Description=Run Enia SQLite backup every 10 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=10min

AccuracySec=30s
Persistent=true

Unit=enia-db-backup.service

[Install]
WantedBy=timers.target
<>

sudo systemctl daemon-reload

sudo systemctl enable --now enia-db-backup.timer

systemctl status enia-db-backup.timer

---

check the rules of the webhook
`cat /etc/webhook/hooks.json`
<details>
<summary>output</summary>

~~~bash
[
  {
    "id": "deploy-enia",
    "execute-command": "/home/ubuntu/deploy.sh",
    "command-working-directory": "/home/ubuntu",
    "response-message": "Deploy triggered",
  }
]
~~~

</details>

---

the actual script triggered on push
`cat /home/ubuntu/deploy.sh`
<details>
<summary>output</summary>

~~~bash
#!/bin/bash
set -Eeuo pipefail

LOG_DIR="/home/ubuntu"
LOG_FILE="$LOG_DIR/deploy.log"
MAX_LOGS=10

# Rotate previous deployment logs
for ((i=MAX_LOGS-1; i>=1; i--)); do
    if [[ -f "$LOG_DIR/deploy-$i.log" ]]; then
        mv "$LOG_DIR/deploy-$i.log" "$LOG_DIR/deploy-$((i+1)).log"
    fi
done

# Current log becomes deploy-1.log
if [[ -f "$LOG_FILE" ]]; then
    mv "$LOG_FILE" "$LOG_DIR/deploy-1.log"
fi

# Remove anything older than the maximum
rm -f "$LOG_DIR/deploy-$((MAX_LOGS+1)).log"

# Start a completely fresh log for this runtime
exec > >(tee -a "$LOG_FILE") 2>&1

trap 'echo "!!! DEPLOY FAILED at line $LINENO with exit code $? !!!"' ERR

REPO_DIR="/home/ubuntu/enia"

echo "=== Deploy started at $(date) ==="

pm2 stop enia
cd "$REPO_DIR"

echo "--- Updating repository ---"
git fetch origin master
git reset --hard origin/master

echo "--- Installing dependencies ---"
npm ci

echo "--- Building ---"
npm run build

echo "--- Restarting server ---"
pm2 restart enia || pm2 start npm --name enia -- start

echo "--- Reloading Caddy ---"
sudo systemctl reload caddy

echo "=== Deploy finished at $(date) ==="
~~~

</details>

---

check pm2 processes
`pm2 list`

check pm2 logs
`pm2 logs enia`

monitor resource usag
`pm2 monit`

---

check caddy reverse proxy file
`cat /etc/caddy/Caddyfile`
<details>
<summary>output</summary>

~~~bash
lore.enia.net {
    encode gzip

    handle /hooks/* {
        reverse_proxy 127.0.0.1:9000
    }

    handle {
        reverse_proxy 127.0.0.1:3000
    }
}
~~~

port 9000 is for github webhooks, port 3000 reaches the nextjs server

</details>

---

check automated jobs that update the ip
`crontab -l`
<details>
<summary>output</summary>

~~~bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/sbin:/usr/local/bin

4,9,14,19,24,29,34,39,44,49,54,59 * * * * sleep 23 ; wget -O - http://freedns.afraid.org/dynamic/update.php?aTdUMzlXQXo0WUdTeklabVZtWmthZ2Q0OjI2NDEyNDIw >> /tmp/freedns_lore_enia_net.log 2>&1 &
~~~

</details>

---

get the last 60 lines of logs from the webhook systemctl and update live
`sudo journalctl -u webhook -n 60 -f`

check caddy logs
`journalctl -u caddy --no-pager`

read the logs of deploy.sh live if you want
`tail -F -n 50 /home/ubuntu/deploy.log`
or just `tail deploy.log -f` yk

read backup logs
`sudo journalctl -u enia-db-backup.service -f`

---

if you wanna edit a file instead of read it, replace "cat" with "sudo nano"
save with **ctrl+O** -> **enter** 
exit with -> **ctrl+X**

you can cancel any live processes (like logs) with **ctrl+C**

here is some usefull next.js documentation
<https://nextjs.org/docs/app/getting-started>