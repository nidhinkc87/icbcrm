<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeePerformanceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $period = $request->query('period', '90');
        $dateFrom = $this->getDateFrom($period);

        $employees = User::role('employee')
            ->with('employee:id,user_id,department,designation,date_of_joining')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->get();

        $employeeMetrics = $employees->map(function (User $emp) use ($dateFrom) {
            $baseQuery = Task::where('responsible_id', $emp->id)
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom));

            $total = (clone $baseQuery)->count();
            $completed = (clone $baseQuery)->where('status', 'completed')->count();
            $onTime = (clone $baseQuery)->where('status', 'completed')
                ->whereRaw('DATE(updated_at) <= due_date')->count();
            $overdue = Task::where('responsible_id', $emp->id)
                ->where('status', '!=', 'completed')
                ->where('due_date', '<', Carbon::today())->count();
            $active = Task::where('responsible_id', $emp->id)
                ->whereIn('status', ['pending', 'in_progress'])->count();
            $avgDays = (clone $baseQuery)->where('status', 'completed')
                ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
                ->value('avg_days');

            return [
                'id' => $emp->id,
                'name' => $emp->name,
                'department' => $emp->employee?->department ?? '-',
                'designation' => $emp->employee?->designation ?? '-',
                'total_tasks' => $total,
                'completed' => $completed,
                'completion_rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'on_time' => $onTime,
                'on_time_rate' => $completed > 0 ? round(($onTime / $completed) * 100) : 0,
                'overdue' => $overdue,
                'active_tasks' => $active,
                'avg_days' => $avgDays ? round($avgDays, 1) : null,
            ];
        })->values();

        // Summary KPIs
        $totalEmployees = $employeeMetrics->count();
        $avgCompletionRate = $totalEmployees > 0 ? round($employeeMetrics->avg('completion_rate')) : 0;
        $avgOnTimeRate = $totalEmployees > 0 ? round($employeeMetrics->filter(fn ($e) => $e['completed'] > 0)->avg('on_time_rate')) : 0;
        $totalOverdue = $employeeMetrics->sum('overdue');

        // Chart data: completion rate ranking
        $completionRanking = $employeeMetrics
            ->filter(fn ($e) => $e['total_tasks'] > 0)
            ->sortByDesc('completion_rate')
            ->map(fn ($e) => ['name' => $e['name'], 'value' => $e['completion_rate']])
            ->values();

        // Chart data: workload distribution
        $workloadDistribution = $employeeMetrics
            ->filter(fn ($e) => $e['active_tasks'] > 0)
            ->sortByDesc('active_tasks')
            ->map(fn ($e) => ['name' => $e['name'], 'value' => $e['active_tasks']])
            ->values();

        return Inertia::render('Admin/Performance/Index', [
            'employees' => $employeeMetrics,
            'kpis' => [
                'total_employees' => $totalEmployees,
                'avg_completion_rate' => $avgCompletionRate,
                'avg_on_time_rate' => $avgOnTimeRate,
                'total_overdue' => $totalOverdue,
            ],
            'charts' => [
                'completion_ranking' => $completionRanking,
                'workload_distribution' => $workloadDistribution,
            ],
            'filters' => [
                'search' => $search,
                'period' => $period,
            ],
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        abort_unless($user->hasRole('employee'), 404);

        $user->load('employee:id,user_id,department,designation,date_of_joining');

        $period = $request->query('period', '90');
        $dateFrom = $this->getDateFrom($period);

        $baseQuery = Task::where('responsible_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom));

        // KPIs
        $total = (clone $baseQuery)->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();
        $onTime = (clone $baseQuery)->where('status', 'completed')
            ->whereRaw('DATE(updated_at) <= due_date')->count();
        $avgDays = (clone $baseQuery)->where('status', 'completed')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');

        // Chart 1: Status distribution (donut)
        $statusDistribution = Task::where('responsible_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($count, $status) => ['name' => ucfirst(str_replace('_', ' ', $status)), 'value' => $count])
            ->values();

        // Chart 2: Monthly completion trend (last 6 months)
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
                'month' => $month->format('M Y'),
                'count' => $monthlyCompletions[$key] ?? 0,
            ]);
        }

        // Chart 3: Priority breakdown (bar)
        $priorityBreakdown = Task::where('responsible_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->selectRaw('priority, count(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
            ->groupBy('priority')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst($row->priority),
                'total' => $row->total,
                'completed' => $row->completed,
            ]);

        // Chart 4: On-time vs late (donut)
        $lateCompleted = (clone $baseQuery)->where('status', 'completed')
            ->whereRaw('DATE(updated_at) > due_date')->count();
        $onTimeVsLate = collect();
        if ($onTime > 0 || $lateCompleted > 0) {
            $onTimeVsLate->push(['name' => 'On Time', 'value' => $onTime]);
            $onTimeVsLate->push(['name' => 'Late', 'value' => $lateCompleted]);
        }

        // Chart 5: Service performance (bar)
        $servicePerformance = Task::where('responsible_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->with('service:id,name')
            ->selectRaw('service_id, count(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
            ->groupBy('service_id')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->service?->name ?? 'Unknown',
                'total' => $row->total,
                'completed' => $row->completed,
            ]);

        // Chart 6: Weekly activity (last 8 weeks)
        $eightWeeksAgo = Carbon::now()->subWeeks(8)->startOfWeek();
        $weeklyComments = TaskComment::where('user_id', $user->id)
            ->where('created_at', '>=', $eightWeeksAgo)
            ->selectRaw("YEARWEEK(created_at, 1) as yw, count(*) as count")
            ->groupBy('yw')
            ->pluck('count', 'yw');
        $weeklyAttachments = TaskAttachment::where('uploaded_by', $user->id)
            ->where('created_at', '>=', $eightWeeksAgo)
            ->selectRaw("YEARWEEK(created_at, 1) as yw, count(*) as count")
            ->groupBy('yw')
            ->pluck('count', 'yw');

        $weeklyActivity = collect();
        for ($i = 7; $i >= 0; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
            $yw = $weekStart->format('oW');
            $weeklyActivity->push([
                'week' => $weekStart->format('M d'),
                'comments' => $weeklyComments[$yw] ?? 0,
                'attachments' => $weeklyAttachments[$yw] ?? 0,
            ]);
        }

        // Recent completed tasks
        $recentTasks = Task::where('responsible_id', $user->id)
            ->where('status', 'completed')
            ->with(['service:id,name', 'client.user:id,name'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'client_name' => $t->client?->user?->name ?? 'Unknown',
                'priority' => $t->priority,
                'due_date' => $t->due_date->format('M d, Y'),
                'completed_at' => $t->updated_at->format('M d, Y'),
                'days_taken' => $t->created_at->diffInDays($t->updated_at),
                'on_time' => $t->updated_at->toDateString() <= $t->due_date->toDateString(),
            ]);

        // Collaboration stats
        $collaboratedTasks = DB::table('task_collaborators')
            ->where('user_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->count();
        $commentsCount = TaskComment::where('user_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->count();
        $attachmentsCount = TaskAttachment::where('uploaded_by', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->count();

        return Inertia::render('Admin/Performance/Show', [
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->employee?->department ?? '-',
                'designation' => $user->employee?->designation ?? '-',
                'date_of_joining' => $user->employee?->date_of_joining?->format('M d, Y'),
            ],
            'kpis' => [
                'total_tasks' => $total,
                'completed' => $completed,
                'on_time_rate' => $completed > 0 ? round(($onTime / $completed) * 100) : 0,
                'avg_days' => $avgDays ? round($avgDays, 1) : 0,
            ],
            'charts' => [
                'status_distribution' => $statusDistribution,
                'completion_trend' => $completionTrend,
                'priority_breakdown' => $priorityBreakdown,
                'on_time_vs_late' => $onTimeVsLate,
                'service_performance' => $servicePerformance,
                'weekly_activity' => $weeklyActivity,
            ],
            'recent_tasks' => $recentTasks,
            'collaboration' => [
                'tasks_collaborated' => $collaboratedTasks,
                'comments_posted' => $commentsCount,
                'attachments_uploaded' => $attachmentsCount,
            ],
            'filters' => ['period' => $period],
        ]);
    }

    private function getDateFrom(string $period): ?Carbon
    {
        return match ($period) {
            '30' => Carbon::now()->subDays(30),
            '90' => Carbon::now()->subDays(90),
            '180' => Carbon::now()->subMonths(6),
            '365' => Carbon::now()->subYear(),
            default => null, // 'all'
        };
    }
}
