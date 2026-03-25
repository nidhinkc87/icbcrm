<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Service;
use App\Models\ServiceSubmission;
use App\Models\Task;
use App\Models\TaskComment;
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
        $role = $user->roles->first()?->name ?? 'client';

        $data = match ($role) {
            'admin' => $this->adminDashboard(),
            'employee' => $this->employeeDashboard($user),
            default => $this->clientDashboard($user),
        };

        return Inertia::render('Dashboard', array_merge(['role' => $role], $data));
    }

    private function adminDashboard(): array
    {
        $today = Carbon::today();

        // KPIs
        $kpis = [
            'total_tasks' => Task::count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'pending_tasks' => Task::where('status', 'pending')->count(),
            'in_progress_tasks' => Task::where('status', 'in_progress')->count(),
            'overdue_tasks' => Task::where('status', '!=', 'completed')->where('due_date', '<', $today)->count(),
            'total_clients' => Client::count(),
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

        // Overdue tasks
        $overdueTasks = Task::where('status', '!=', 'completed')
            ->where('due_date', '<', $today)
            ->with(['service:id,name', 'client.user:id,name', 'responsible:id,name'])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'client_name' => $t->client?->user?->name ?? 'Unknown',
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
        ];
    }

    private function employeeDashboard(User $user): array
    {
        $today = Carbon::today();

        $baseQuery = Task::where('responsible_id', $user->id);

        $kpis = [
            'my_tasks' => (clone $baseQuery)->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'overdue' => (clone $baseQuery)->where('status', '!=', 'completed')->where('due_date', '<', $today)->count(),
        ];

        $statusDistribution = Task::where('responsible_id', $user->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        $upcomingTasks = Task::where('responsible_id', $user->id)
            ->where('status', '!=', 'completed')
            ->where('due_date', '>=', $today)
            ->where('due_date', '<=', $today->copy()->addDays(7))
            ->with(['service:id,name', 'client.user:id,name'])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'client_name' => $t->client?->user?->name ?? 'Unknown',
                'due_date' => $t->due_date->format('M d, Y'),
                'priority' => $t->priority,
                'status' => $t->status,
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
            ],
            'upcoming_tasks' => $upcomingTasks,
            'recent_activity' => $recentActivity,
        ];
    }

    private function clientDashboard(User $user): array
    {
        $today = Carbon::today();
        $client = $user->client;

        if (! $client) {
            return [
                'kpis' => ['total_tasks' => 0, 'completed' => 0, 'in_progress' => 0, 'pending' => 0],
                'charts' => ['status_distribution' => []],
                'service_progress' => [],
                'recent_activity' => [],
            ];
        }

        $baseQuery = Task::where('client_id', $client->id);

        $kpis = [
            'total_tasks' => (clone $baseQuery)->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
        ];

        $statusDistribution = Task::where('client_id', $client->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        $serviceProgress = Task::where('client_id', $client->id)
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

        $recentActivity = Task::where('client_id', $client->id)
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
        ];
    }
}
