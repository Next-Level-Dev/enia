# Hosting rundown

---

connecting to the vps
> ssh ubuntu@129.151.245.112 -i "C:\Users\utq\Desktop\enia\ssh-key-2026-07-03.key"

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
set -e

REPO_DIR="/home/ubuntu/enia"

echo "=== Deploy started at $(date) ==="

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

get the last 30 lines of importnat logs from the webhook systemctl and update live
`sudo journalctl -u webhook -p err -n 30 -f`

---

if you wanna edit a file instead of read it, replace "cat" with "sudo nano"
save with **ctrl+O** -> **enter** 
exit with -> **ctrl+X**

you can cancel any live processes (like logs) with **ctrl+C**

here is some usefull next.js documentation
<https://nextjs.org/docs/app/getting-started>