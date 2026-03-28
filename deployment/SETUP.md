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

### Option A: Supervisor (Recommended for Production)

1. Install Supervisor:
```bash
sudo apt install supervisor
```

2. Copy the config:
```bash
sudo cp deployment/supervisor/icbcrm-worker.conf /etc/supervisor/conf.d/
```

3. Update the path in the config file to match your server's project path.

4. Start the worker:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start icbcrm-worker:*
```

5. Check status:
```bash
sudo supervisorctl status
```

### Option B: Simple (for testing / small deployments)

```bash
php artisan queue:work --sleep=3 --tries=3 &
```

### After Deployment

Always restart the queue worker after deploying new code:
```bash
php artisan queue:restart
```

## 3. Manual Commands

Run commands manually for testing:

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
```

## 4. Monitoring

Check pending/failed jobs:
```bash
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . ' | Failed: ' . DB::table('failed_jobs')->count();"
```
