<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Service;
use App\Models\ServiceSubmission;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskQuery;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user->roles->first()?->name ?? 'customer';

        $data = match ($role) {
            'admin' => $this->adminDashboard($user),
            'employee' => $this->employeeDashboard($user),
            'partner' => $this->partnerDashboard($user),
            default => $this->customerDashboard($user),
        };

        return Inertia::render('Dashboard', array_merge(['role' => $role], $data));
    }

    private function adminDashboard(User $user): array
    {
        $today = Carbon::today();

        // KPIs
        $kpis = [
            'total_tasks' => Task::count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'pending_tasks' => Task::where('status', 'pending')->count(),
            'in_progress_tasks' => Task::where('status', 'in_progress')->count(),
            'overdue_tasks' => Task::where('status', '!=', 'completed')->where('due_date', '<', $today)->count(),
            'total_customers' => Customer::count(),
            'total_employees' => User::role('employee')->count(),
        ];

        // Status distribution
        $statusDistribution = Task::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        // Priority distribution
        $priorityDistribution = Task::selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->map(fn ($count, $priority) => ['name' => ucfirst($priority), 'value' => $count])
            ->values();

        // Completion trend (last 30 days)
        $thirtyDaysAgo = $today->copy()->subDays(29);
        $completedByDate = Task::where('status', 'completed')
            ->where('updated_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(updated_at) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $completionTrend = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i)->format('Y-m-d');
            $completionTrend->push([
                'date' => Carbon::parse($date)->format('M d'),
                'count' => $completedByDate[$date] ?? 0,
            ]);
        }

        // Employee workload
        $employeeWorkload = Task::where('status', '!=', 'completed')
            ->selectRaw('responsible_id, count(*) as count')
            ->groupBy('responsible_id')
            ->with('responsible:id,name')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->responsible?->name ?? 'Unknown',
                'value' => $item->count,
            ])
            ->sortByDesc('value')
            ->values();

        // Service usage
        $serviceUsage = Task::selectRaw('service_id, count(*) as count')
            ->groupBy('service_id')
            ->with('service:id,name')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->service?->name ?? 'Unknown',
                'value' => $item->count,
            ])
            ->sortByDesc('value')
            ->values();

        // Recent activity
        $recentTasks = Task::with(['service:id,name', 'responsible:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'type' => 'task',
                'description' => "Task #{$t->id} ({$t->service?->name}) assigned to {$t->responsible?->name}",
                'status' => $t->status,
                'timestamp' => $t->created_at->diffForHumans(),
                'link' => route('tasks.show', $t->id),
            ]);

        $recentComments = TaskComment::with(['user:id,name', 'task:id'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'type' => 'comment',
                'description' => "{$c->user?->name} commented on Task #{$c->task_id}",
                'status' => null,
                'timestamp' => $c->created_at->diffForHumans(),
                'link' => route('tasks.show', $c->task_id),
            ]);

        $recentActivity = $recentTasks->merge($recentComments)
            ->sortByDesc(fn ($item) => $item['timestamp'])
            ->values()
            ->take(10);

        // Upcoming expirations
        $upcomingExpirations = CustomerDocument::whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $today->copy()->addDays(60))
            ->where('expiry_date', '>=', $today->copy()->subDays(30)) // include recently expired
            ->with(['customer.user:id,name', 'documentType:id,name', 'partner:id,name', 'branch:id,name'])
            ->orderBy('expiry_date')
            ->limit(15)
            ->get()
            ->map(fn (CustomerDocument $d) => [
                'id' => $d->id,
                'customer_name' => $d->customer?->user?->name ?? 'Unknown',
                'customer_id' => $d->customer?->user_id,
                'document_type' => $d->documentType?->name ?? 'Unknown',
                'context' => $d->partner?->name ? "Partner: {$d->partner->name}" : ($d->branch?->name ? "Branch: {$d->branch->name}" : null),
                'reference' => $d->value,
                'expiry_date' => $d->expiry_date->format('M d, Y'),
                'days_remaining' => (int) $today->diffInDays($d->expiry_date, false),
                'is_expired' => $d->expiry_date->isPast(),
            ]);

        // Overdue tasks
        $overdueTasks = Task::where('status', '!=', 'completed')
            ->where('due_date', '<', $today)
            ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'customer_name' => $t->customer?->user?->name ?? 'Unknown',
                'responsible_name' => $t->responsible?->name ?? 'Unknown',
                'due_date' => $t->due_date->format('M d, Y'),
                'days_overdue' => $t->due_date->diffInDays($today),
            ]);

        return [
            'kpis' => $kpis,
            'charts' => [
                'status_distribution' => $statusDistribution,
                'priority_distribution' => $priorityDistribution,
                'completion_trend' => $completionTrend,
                'employee_workload' => $employeeWorkload,
                'service_usage' => $serviceUsage,
            ],
            'recent_activity' => $recentActivity,
            'overdue_tasks' => $overdueTasks,
            'upcoming_expirations' => $upcomingExpirations,
            'pending_queries' => $this->pendingQueries($user),
        ];
    }

    private function employeeDashboard(User $user): array
    {
        $today = Carbon::today();

        $baseQuery = Task::where('responsible_id', $user->id);

        $completed = (clone $baseQuery)->where('status', 'completed')->count();
        $onTime = (clone $baseQuery)->where('status', 'completed')
            ->whereRaw('DATE(updated_at) <= due_date')->count();
        $avgDays = (clone $baseQuery)->where('status', 'completed')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');

        $kpis = [
            'my_tasks' => (clone $baseQuery)->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => $completed,
            'overdue' => (clone $baseQuery)->where('status', '!=', 'completed')->where('due_date', '<', $today)->count(),
            'on_time_rate' => $completed > 0 ? round(($onTime / $completed) * 100) : 0,
            'avg_days' => $avgDays ? round($avgDays, 1) : 0,
        ];

        // Status distribution (donut)
        $statusDistribution = Task::where('responsible_id', $user->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        // Priority breakdown (bar)
        $priorityDistribution = Task::where('responsible_id', $user->id)
            ->selectRaw('priority, count(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
            ->groupBy('priority')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst($row->priority),
                'total' => $row->total,
                'completed' => $row->completed,
            ]);

        // Monthly completion trend (last 6 months)
        $sixMonthsAgo = Carbon::now()->subMonths(6)->startOfMonth();
        $monthlyCompletions = Task::where('responsible_id', $user->id)
            ->where('status', 'completed')
            ->where('updated_at', '>=', $sixMonthsAgo)
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        $completionTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m');
            $completionTrend->push([
                'month' => $month->format('M'),
                'count' => $monthlyCompletions[$key] ?? 0,
            ]);
        }

        // On-time vs late (donut)
        $lateCompleted = (clone $baseQuery)->where('status', 'completed')
            ->whereRaw('DATE(updated_at) > due_date')->count();
        $onTimeVsLate = collect();
        if ($onTime > 0 || $lateCompleted > 0) {
            $onTimeVsLate->push(['name' => 'On Time', 'value' => $onTime]);
            $onTimeVsLate->push(['name' => 'Late', 'value' => $lateCompleted]);
        }

        // Upcoming tasks (next 7 days)
        $upcomingTasks = Task::where('responsible_id', $user->id)
            ->where('status', '!=', 'completed')
            ->where('due_date', '>=', $today)
            ->where('due_date', '<=', $today->copy()->addDays(7))
            ->with(['service:id,name', 'customer.user:id,name'])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'customer_name' => $t->customer?->user?->name ?? 'Unknown',
                'due_date' => $t->due_date->format('M d, Y'),
                'priority' => $t->priority,
                'status' => $t->status,
            ]);

        // Overdue tasks
        $overdueTasks = Task::where('responsible_id', $user->id)
            ->where('status', '!=', 'completed')
            ->where('due_date', '<', $today)
            ->with(['service:id,name', 'customer.user:id,name'])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'customer_name' => $t->customer?->user?->name ?? 'Unknown',
                'due_date' => $t->due_date->format('M d, Y'),
                'days_overdue' => $t->due_date->diffInDays($today),
                'priority' => $t->priority,
            ]);

        // Collaborator tasks (tasks where this user is a collaborator, not responsible)
        $collaboratorTasks = Task::whereHas('collaborators', fn ($q) => $q->where('users.id', $user->id))
            ->where('responsible_id', '!=', $user->id)
            ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'customer_name' => $t->customer?->user?->name ?? 'Unknown',
                'responsible_name' => $t->responsible?->name ?? 'Unknown',
                'status' => $t->status,
                'due_date' => $t->due_date->format('M d, Y'),
                'priority' => $t->priority,
                'can_work' => $t->collaborators->where('id', $user->id)->first()?->pivot->can_work ?? false,
            ]);

        $recentActivity = TaskComment::whereHas('task', fn ($q) => $q->where('responsible_id', $user->id))
            ->with(['user:id,name', 'task:id'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'type' => 'comment',
                'description' => "{$c->user?->name} commented on Task #{$c->task_id}",
                'timestamp' => $c->created_at->diffForHumans(),
                'link' => route('tasks.show', $c->task_id),
            ]);

        return [
            'kpis' => $kpis,
            'charts' => [
                'status_distribution' => $statusDistribution,
                'priority_distribution' => $priorityDistribution,
                'completion_trend' => $completionTrend,
                'on_time_vs_late' => $onTimeVsLate,
            ],
            'upcoming_tasks' => $upcomingTasks,
            'overdue_tasks' => $overdueTasks,
            'collaborator_tasks' => $collaboratorTasks,
            'recent_activity' => $recentActivity,
            'pending_queries' => $this->pendingQueries($user),
        ];
    }

    private function customerDashboard(User $user): array
    {
        $today = Carbon::today();
        $customer = $user->customer;

        if (! $customer) {
            return [
                'kpis' => ['total_tasks' => 0, 'completed' => 0, 'in_progress' => 0, 'pending' => 0],
                'charts' => ['status_distribution' => []],
                'service_progress' => [],
                'recent_activity' => [],
            ];
        }

        $baseQuery = Task::where('customer_id', $customer->id);

        $kpis = [
            'total_tasks' => (clone $baseQuery)->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
        ];

        $statusDistribution = Task::where('customer_id', $customer->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        $serviceProgress = Task::where('customer_id', $customer->id)
            ->with('service:id,name')
            ->get()
            ->groupBy('service_id')
            ->map(function ($tasks, $serviceId) {
                $service = $tasks->first()->service;
                return [
                    'service_name' => $service?->name ?? 'Unknown',
                    'total' => $tasks->count(),
                    'completed' => $tasks->where('status', 'completed')->count(),
                    'in_progress' => $tasks->where('status', 'in_progress')->count(),
                    'pending' => $tasks->where('status', 'pending')->count(),
                ];
            })
            ->values();

        $recentActivity = Task::where('customer_id', $customer->id)
            ->with(['service:id,name'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'type' => 'task',
                'description' => "Task #{$t->id} ({$t->service?->name}) — " . ucfirst(str_replace('_', ' ', $t->status)),
                'status' => $t->status,
                'timestamp' => $t->updated_at->diffForHumans(),
            ]);

        return [
            'kpis' => $kpis,
            'charts' => ['status_distribution' => $statusDistribution],
            'service_progress' => $serviceProgress,
            'recent_activity' => $recentActivity,
            'pending_queries' => $this->pendingQueries($user),
        ];
    }

    private function partnerDashboard(User $user): array
    {
        $partner = $user->partner;

        if (! $partner) {
            return [
                'kpis' => ['total_tasks' => 0, 'completed' => 0, 'in_progress' => 0, 'pending' => 0, 'total_customers' => 0],
                'charts' => ['status_distribution' => []],
                'customer_breakdown' => [],
                'recent_activity' => [],
                'pending_queries' => [],
            ];
        }

        $customerIds = $partner->customers()->pluck('customers.id');
        $baseQuery = Task::whereIn('customer_id', $customerIds);

        $kpis = [
            'total_tasks' => (clone $baseQuery)->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'total_customers' => $customerIds->count(),
        ];

        $statusDistribution = Task::whereIn('customer_id', $customerIds)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        $customerBreakdown = $partner->customers()->with('user:id,name')->get()->map(function ($customer) {
            $tasks = Task::where('customer_id', $customer->id);

            return [
                'customer_name' => $customer->user?->name ?? '-',
                'total' => (clone $tasks)->count(),
                'completed' => (clone $tasks)->where('status', 'completed')->count(),
                'in_progress' => (clone $tasks)->where('status', 'in_progress')->count(),
                'pending' => (clone $tasks)->where('status', 'pending')->count(),
            ];
        });

        $recentActivity = Task::whereIn('customer_id', $customerIds)
            ->with(['service:id,name', 'customer.user:id,name'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'type' => 'task',
                'description' => ($t->customer?->user?->name ?? 'Unknown') . " — {$t->service?->name} — " . ucfirst(str_replace('_', ' ', $t->status)),
                'status' => $t->status,
                'timestamp' => $t->updated_at->diffForHumans(),
            ]);

        return [
            'kpis' => $kpis,
            'charts' => ['status_distribution' => $statusDistribution],
            'customer_breakdown' => $customerBreakdown,
            'recent_activity' => $recentActivity,
            'pending_queries' => $this->pendingQueries($user),
        ];
    }

    private function pendingQueries(User $user): array
    {
        return TaskQuery::where('directed_to', $user->id)
            ->whereIn('status', ['open', 'answered'])
            ->with(['task.service:id,name', 'raisedBy:id,name'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (TaskQuery $q) => [
                'id' => $q->id,
                'task_id' => $q->task_id,
                'subject' => $q->subject,
                'priority' => $q->priority,
                'status' => $q->status,
                'raised_by_name' => $q->raisedBy?->name ?? 'Unknown',
                'service_name' => $q->task?->service?->name ?? 'Unknown',
                'created_at' => $q->created_at->diffForHumans(),
            ])
            ->all();
    }
}
