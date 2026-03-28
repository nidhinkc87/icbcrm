# ICB CRM — Production Setup Guide

## 1. Cron Job (Laravel Scheduler)

Add this single cron entry on the server:

```bash
crontab -e
```

```
* * * * * cd /path-to-icbcrm && php artisan schedule:run >> /dev/null 2>&1
```

This runs the following scheduled commands:

| Time     | Command                      | Purpose                                         |
|----------|------------------------------|-------------------------------------------------|
| 7:00 AM  | `expiry:check-and-act`       | Check document expiry, auto-create tasks, notify |
| 8:00 AM  | `tasks:send-due-reminders`   | Remind about tasks due within 3 days             |
| 9:00 AM  | `tasks:send-overdue-alerts`  | Alert about overdue tasks                        |

## 2. Queue Worker (Email Processing)

All email notifications are queued (`ShouldQueue`). A queue worker must be running to process them.

### Supervisor Config

```bash
sudo apt install supervisor
sudo cp deployment/supervisor/icbcrm-worker.conf /etc/supervisor/conf.d/
sudo cp deployment/supervisor/icbcrm-reverb.conf /etc/supervisor/conf.d/
```

Update the paths in both config files to match your server's project path, then:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

Check status:
```bash
sudo supervisorctl status
```

## 3. Reverb (WebSocket Server)

Reverb provides real-time notifications via WebSocket.

### .env Configuration (Production)

```env
REVERB_HOST="icb.calcker.com"
REVERB_PORT=8080
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Nginx Proxy (recommended)

Add to your Nginx site config to proxy WebSocket through port 80/443:

```nginx
location /app {
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Scheme $scheme;
    proxy_set_header SERVER_PORT $server_port;
    proxy_set_header REMOTE_ADDR $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass http://127.0.0.1:8080;
}
```

With Nginx proxy, clients connect on port 80/443 (no need to open 8080).

### HTTPS / SSL

When SSL is configured (e.g., via Certbot):
1. Update `.env`: `REVERB_SCHEME=https`
2. Nginx handles SSL termination, Reverb stays on http internally
3. Rebuild frontend: `npm run build`

## 4. Deployment Script

After every deploy, run:

```bash
cd /path-to-icbcrm
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
php artisan queue:restart
sudo supervisorctl restart all
```

## 5. Manual Commands

```bash
# Process queued emails now
php artisan queue:work --once

# Check document expiry manually
php artisan expiry:check-and-act

# Send due reminders manually
php artisan tasks:send-due-reminders

# Send overdue alerts manually
php artisan tasks:send-overdue-alerts

# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Start Reverb manually
php artisan reverb:start
```

## 6. Monitoring

```bash
# Check pending/failed jobs
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . ' | Failed: ' . DB::table('failed_jobs')->count();"

# Check Supervisor processes
sudo supervisorctl status

# Check Reverb logs
tail -f storage/logs/reverb.log

# Check queue worker logs
tail -f storage/logs/worker.log
```
