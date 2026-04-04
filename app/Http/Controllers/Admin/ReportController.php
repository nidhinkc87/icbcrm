<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerPartner;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use App\Exports\CustomersExport;
use App\Exports\EmployeesExport;
use App\Exports\EmployeeShowExport;
use App\Exports\PartnersExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    // ── Customers ──────────────────────────────────────────

    public function customers(Request $request): Response
    {
        $filters = $this->customerFilters($request);
        $paginated = $this->customerQuery($request)->paginate(25)->withQueryString();

        $customers = $paginated->through(fn ($c) => $this->formatCustomer($c));

        return Inertia::render('Admin/Reports/Customers', [
            'customers' => $customers,
            'filters' => $filters,
        ]);
    }

    public function customersPdf(Request $request)
    {
        $customers = $this->customerQuery($request)->get()->map(fn ($c) => $this->formatCustomer($c))->values()->toArray();
        $filtersMeta = $this->buildFiltersMeta($this->customerFilters($request));

        $pdf = Pdf::loadView('reports.customers', compact('customers', 'filtersMeta'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('customer-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function customersExcel(Request $request)
    {
        $customers = $this->customerQuery($request)->get()->map(fn ($c) => $this->formatCustomer($c))->values()->toArray();

        return Excel::download(new CustomersExport($customers), 'customer-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    private function customerQuery(Request $request)
    {
        $search = $request->query('search');
        $emirate = $request->query('emirate');
        $legalType = $request->query('legal_type');

        return Customer::with(['user', 'documents.documentType', 'partners', 'bankDetail'])
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                    ->orWhere('trade_license_no', 'like', "%{$search}%");
            }))
            ->when($emirate, fn ($q) => $q->where('emirate', $emirate))
            ->when($legalType, fn ($q) => $q->where('legal_type', $legalType));
    }

    private function formatCustomer(Customer $c): array
    {
        $today = Carbon::today();
        $soon = Carbon::today()->addDays(30);

        $docs = $c->documents->whereNotNull('expiry_date');
        $expired = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
        $expiring = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

        $totalTasks = Task::where('customer_id', $c->id)->count();
        $pendingTasks = Task::where('customer_id', $c->id)->where('status', '!=', 'completed')->count();

        return [
            'id' => $c->user_id,
            'name' => $c->user?->name ?? '-',
            'email' => $c->user?->email ?? '-',
            'phone' => $c->phone ?? '-',
            'emirate' => $c->emirate ?? '-',
            'legal_type' => $c->legal_type ?? '-',
            'trade_license_no' => $c->trade_license_no ?? '-',
            'total_docs' => $c->documents->count(),
            'expired_docs' => $expired,
            'expiring_docs' => $expiring,
            'total_tasks' => $totalTasks,
            'pending_tasks' => $pendingTasks,
        ];
    }

    private function customerFilters(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'emirate' => $request->query('emirate'),
            'legal_type' => $request->query('legal_type'),
        ];
    }

    // ── Partners ───────────────────────────────────────────

    public function partners(Request $request): Response
    {
        $filters = $this->partnerFilters($request);
        $paginated = $this->partnerQuery($request)->paginate(25)->withQueryString();

        $partners = $paginated->through(fn ($p) => $this->formatPartner($p));

        return Inertia::render('Admin/Reports/Partners', [
            'partners' => $partners,
            'filters' => $filters,
        ]);
    }

    public function partnersPdf(Request $request)
    {
        $partners = $this->partnerQuery($request)->get()->map(fn ($p) => $this->formatPartner($p))->values()->toArray();
        $filtersMeta = $this->buildFiltersMeta($this->partnerFilters($request));

        $pdf = Pdf::loadView('reports.partners', compact('partners', 'filtersMeta'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('partner-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function partnersExcel(Request $request)
    {
        $partners = $this->partnerQuery($request)->get()->map(fn ($p) => $this->formatPartner($p))->values()->toArray();

        return Excel::download(new PartnersExport($partners), 'partner-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    private function partnerQuery(Request $request)
    {
        $search = $request->query('search');
        $customer = $request->query('customer');

        return CustomerPartner::with(['customer.user', 'documents.documentType'])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhereHas('customer.user', fn ($u) => $u->where('email', 'like', "%{$search}%")))
            ->when($customer, fn ($q) => $q->whereHas('customer.user', fn ($u) => $u->where('name', 'like', "%{$customer}%")));
    }

    private function formatPartner(CustomerPartner $p): array
    {
        $today = Carbon::today();
        $soon = Carbon::today()->addDays(30);

        $docs = $p->documents->whereNotNull('expiry_date');
        $expired = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
        $expiring = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

        // Extract specific document values
        $eidDoc = $p->documents->first(fn ($d) => $d->documentType?->slug === 'partner_emirates_id');
        $passDoc = $p->documents->first(fn ($d) => $d->documentType?->slug === 'partner_passport');

        return [
            'id' => $p->id,
            'name' => $p->name,
            'customer_name' => $p->customer?->user?->name ?? '-',
            'emirates_id_no' => $eidDoc?->value ?? '-',
            'passport_no' => $passDoc?->value ?? '-',
            'total_docs' => $p->documents->count(),
            'expired_docs' => $expired,
            'expiring_docs' => $expiring,
        ];
    }

    private function partnerFilters(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'customer' => $request->query('customer'),
        ];
    }

    // ── Employees ──────────────────────────────────────────

    public function employees(Request $request): Response
    {
        $filters = $this->employeeFilters($request);
        $employees = $this->getEmployeeMetrics($request);

        return Inertia::render('Admin/Reports/Employees', [
            'employees' => $employees,
            'filters' => $filters,
        ]);
    }

    public function employeesPdf(Request $request)
    {
        $employees = $this->getEmployeeMetrics($request)->toArray();
        $filtersMeta = $this->buildFiltersMeta($this->employeeFilters($request));

        $pdf = Pdf::loadView('reports.employees', compact('employees', 'filtersMeta'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('employee-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function employeesExcel(Request $request)
    {
        $employees = $this->getEmployeeMetrics($request)->toArray();

        return Excel::download(new EmployeesExport($employees), 'employee-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    private function getEmployeeMetrics(Request $request)
    {
        $search = $request->query('search');
        $department = $request->query('department');
        $period = $request->query('period', '90');
        $dateFrom = $this->getDateFrom($period);

        $employees = User::role('employee')
            ->with('employee:id,user_id,department,designation,date_of_joining')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ->when($department, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('department', $department)))
            ->get();

        return $employees->map(function (User $emp) use ($dateFrom) {
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
                'date_of_joining' => $emp->employee?->date_of_joining?->format('M d, Y'),
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
    }

    private function employeeFilters(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'department' => $request->query('department'),
            'period' => $request->query('period', '90'),
        ];
    }

    // ── Individual Employee ────────────────────────────────

    public function employeeShow(Request $request, User $user): Response
    {
        abort_unless($user->hasRole('employee'), 404);
        $data = $this->getEmployeeShowData($request, $user);

        return Inertia::render('Admin/Reports/EmployeeShow', $data);
    }

    public function employeeShowPdf(Request $request, User $user)
    {
        abort_unless($user->hasRole('employee'), 404);
        $data = $this->getEmployeeShowData($request, $user);

        $pdf = Pdf::loadView('reports.employee-show', $data)
            ->setPaper('a4', 'landscape');

        return $pdf->download('employee-performance-' . str($user->name)->slug() . '-' . now()->format('Y-m-d') . '.pdf');
    }

    public function employeeShowExcel(Request $request, User $user)
    {
        abort_unless($user->hasRole('employee'), 404);
        $data = $this->getEmployeeShowData($request, $user);

        return Excel::download(new EmployeeShowExport($data), 'employee-performance-' . str($user->name)->slug() . '-' . now()->format('Y-m-d') . '.xlsx');
    }

    private function getEmployeeShowData(Request $request, User $user): array
    {
        $user->load('employee:id,user_id,department,designation,date_of_joining');

        $period = $request->query('period', '90');
        $dateFrom = $this->getDateFrom($period);

        $baseQuery = Task::where('responsible_id', $user->id)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom));

        $total = (clone $baseQuery)->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();
        $onTime = (clone $baseQuery)->where('status', 'completed')
            ->whereRaw('DATE(updated_at) <= due_date')->count();
        $avgDays = (clone $baseQuery)->where('status', 'completed')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');
        $overdue = Task::where('responsible_id', $user->id)
            ->where('status', '!=', 'completed')
            ->where('due_date', '<', Carbon::today())->count();

        // Priority breakdown
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

        // Service performance
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

        // Recent completed tasks
        $recentTasks = Task::where('responsible_id', $user->id)
            ->where('status', 'completed')
            ->with(['service:id,name', 'customer.user:id,name'])
            ->latest('updated_at')
            ->limit(15)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Unknown',
                'customer_name' => $t->customer?->user?->name ?? 'Unknown',
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

        return [
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
                'overdue' => $overdue,
            ],
            'priority_breakdown' => $priorityBreakdown,
            'service_performance' => $servicePerformance,
            'recent_tasks' => $recentTasks,
            'collaboration' => [
                'tasks_collaborated' => $collaboratedTasks,
                'comments_posted' => $commentsCount,
                'attachments_uploaded' => $attachmentsCount,
            ],
            'filters' => ['period' => $period],
        ];
    }

    // ── Helpers ─────────────────────────────────────────────

    private function getDateFrom(string $period): ?Carbon
    {
        return match ($period) {
            '30' => Carbon::now()->subDays(30),
            '90' => Carbon::now()->subDays(90),
            '180' => Carbon::now()->subMonths(6),
            '365' => Carbon::now()->subYear(),
            default => null,
        };
    }

    private function buildFiltersMeta(array $filters): ?string
    {
        $parts = [];
        foreach ($filters as $key => $value) {
            if ($value && $key !== 'period') {
                $parts[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . $value;
            }
        }
        if (isset($filters['period'])) {
            $label = match ($filters['period']) {
                '30' => 'Last 30 days',
                '90' => 'Last 90 days',
                '180' => 'Last 6 months',
                '365' => 'Last year',
                default => 'All time',
            };
            $parts[] = 'Period: ' . $label;
        }

        return count($parts) > 0 ? implode(' | ', $parts) : null;
    }
}
