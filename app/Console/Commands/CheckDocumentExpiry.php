<?php

namespace App\Console\Commands;

use App\Models\CustomerDocument;
use App\Models\ExpiryActionLog;
use App\Models\ExpiryActionRule;
use App\Models\Task;
use App\Models\User;
use App\Notifications\Task\TaskCreated;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckDocumentExpiry extends Command
{
    protected $signature = 'expiry:check-and-act';

    protected $description = 'Check customer document expiry dates and trigger configured actions (notifications/task creation)';

    public function handle(): int
    {
        $rules = ExpiryActionRule::where('is_active', true)
            ->with(['documentType', 'service'])
            ->get();

        if ($rules->isEmpty()) {
            $this->info('No active expiry rules found.');
            return Command::SUCCESS;
        }

        $today = now()->startOfDay();
        $actionsCount = 0;

        foreach ($rules as $rule) {
            $triggerDate = $today->copy()->addDays($rule->trigger_days_before);

            // Find documents of this type that expire on or before the trigger date and haven't been actioned
            $documents = CustomerDocument::where('document_type_id', $rule->document_type_id)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '<=', $triggerDate)
                ->whereDate('expiry_date', '>=', $today->copy()->subDays(90)) // Don't process very old expirations
                ->with(['customer.user', 'partner', 'branch'])
                ->get();

            foreach ($documents as $doc) {
                // Check if already actioned
                $alreadyActioned = ExpiryActionLog::where('rule_id', $rule->id)
                    ->where('customer_document_id', $doc->id)
                    ->where('expiry_date', $doc->expiry_date)
                    ->exists();

                if ($alreadyActioned) {
                    continue;
                }

                $customer = $doc->customer;
                if (! $customer?->user) {
                    continue;
                }

                $tasks = collect();

                if ($rule->action === 'auto_create_task' && ! empty($rule->service_ids)) {
                    foreach ($rule->service_ids as $serviceId) {
                        $tasks->push($this->createTask($rule, $customer, $doc, $serviceId));
                    }
                }

                // Log the action
                ExpiryActionLog::create([
                    'rule_id' => $rule->id,
                    'customer_id' => $customer->id,
                    'customer_document_id' => $doc->id,
                    'expiry_date' => $doc->expiry_date,
                    'action_taken' => $tasks->isNotEmpty() ? 'task_created' : 'notified',
                    'task_id' => $tasks->first()?->id,
                ]);

                // Send notifications
                $this->sendNotifications($rule, $customer, $doc, $tasks->first());

                $actionsCount++;
            }
        }

        $this->info("Processed {$actionsCount} expiry actions.");

        return Command::SUCCESS;
    }

    private function createTask(ExpiryActionRule $rule, $customer, CustomerDocument $doc, int $serviceId): Task
    {
        // Determine assignee
        $assigneeId = $this->resolveAssignee($rule, $customer, $serviceId);

        $context = $doc->partner ? " (Partner: {$doc->partner->name})" : '';
        $context .= $doc->branch ? " (Branch: {$doc->branch->name})" : '';
        $daysLabel = $doc->expiry_date->isPast()
            ? $doc->expiry_date->diffInDays(now()) . ' days overdue'
            : 'expires ' . $doc->expiry_date->format('M d, Y');

        $task = Task::create([
            'created_by' => $assigneeId,
            'service_id' => $serviceId,
            'customer_id' => $customer->id,
            'responsible_id' => $assigneeId,
            'priority' => $rule->priority,
            'status' => 'pending',
            'due_date' => $doc->expiry_date->isPast() ? now()->addDays(7) : $doc->expiry_date,
            'instructions' => "Auto-generated: {$rule->documentType->name} for {$customer->user->name}{$context} {$daysLabel}.\n\nPlease process the renewal/update.",
        ]);

        // Notify the assigned employee
        $task->load(['service:id,name', 'customer.user:id,name', 'responsible:id,name,email', 'creator:id,name']);
        $assignee = User::find($assigneeId);
        if ($assignee) {
            $assignee->notify(new TaskCreated($task));
        }

        return $task;
    }

    private function resolveAssignee(ExpiryActionRule $rule, $customer, int $serviceId): int
    {
        if ($rule->assignment_strategy === 'specific_employee' && $rule->assigned_employee_id) {
            return $rule->assigned_employee_id;
        }

        if ($rule->assignment_strategy === 'last_employee') {
            // Find the last completed task for this customer + service
            $lastTask = Task::where('customer_id', $customer->id)
                ->where('service_id', $serviceId)
                ->where('status', 'completed')
                ->latest('updated_at')
                ->first();

            if ($lastTask) {
                return $lastTask->responsible_id;
            }
        }

        // Fallback to first admin
        return User::role('admin')->first()?->id ?? 1;
    }

    private function sendNotifications(ExpiryActionRule $rule, $customer, CustomerDocument $doc, ?Task $task): void
    {
        $recipients = collect();

        if ($rule->notify_customer && $customer->user) {
            $recipients->push($customer->user);
        }

        if ($rule->notify_admin) {
            $admins = User::role('admin')->get();
            $recipients = $recipients->merge($admins);
        }

        // For now, use a simple mail notification
        // A dedicated ExpiryNotification class can be created later for richer formatting
        if ($recipients->isNotEmpty()) {
            $daysLabel = $doc->expiry_date->isPast()
                ? $doc->expiry_date->diffInDays(now()) . ' days overdue'
                : $doc->expiry_date->diffInDays(now()) . ' days remaining';

            Notification::send($recipients->unique('id'), new \App\Notifications\DocumentExpiryAlert(
                $customer,
                $doc,
                $rule,
                $daysLabel,
                $task
            ));
        }
    }
}
