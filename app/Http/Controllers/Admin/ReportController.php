<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\CustomerPartner;
use App\Models\Service;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use App\Exports\AllEmployeesPerformanceExport;
use App\Exports\CustomersExport;
use App\Exports\EmployeesExport;
use App\Exports\EmployeeOutExport;
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
    // ── Report Dashboard ──────────────────────────────────

    public function dashboard(): Response
    {
        $today = Carbon::today();
        $soon = $today->copy()->addDays(30);

        // ── Service summary ──
        $services = Service::withCount([
            'submissions as total_tasks' => fn ($q) => $q,
        ])->get();

        $serviceRows = $services->map(function (Service $s) {
            $total = Task::where('service_id', $s->id)->count();
            $completed = Task::where('service_id', $s->id)->where('status', 'completed')->count();

            return [
                'id' => $s->id,
                'name' => $s->name,
                'total_tasks' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'is_active' => $s->is_active,
            ];
        })->values();

        // ── Customer summary ──
        $customers = Customer::with(['user', 'documents' => fn ($q) => $q->whereNotNull('expiry_date')])->get();

        $customerRows = $customers->map(function (Customer $c) use ($today, $soon) {
            $total = Task::where('customer_id', $c->id)->count();
            $completed = Task::where('customer_id', $c->id)->where('status', 'completed')->count();
            $docs = $c->documents;
            $expired = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
            $expiring = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();
            $renewals = $expired + $expiring;
            $hasActiveTasks = Task::where('customer_id', $c->id)->whereIn('status', ['pending', 'in_progress'])->exists();

            return [
                'id' => $c->user_id,
                'name' => $c->user?->name ?? '-',
                'total_tasks' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'renewals' => $renewals,
                'is_active' => $hasActiveTasks,
            ];
        })->values();

        // ── Partner summary ──
        $partners = CustomerPartner::with(['customer.user', 'documents' => fn ($q) => $q->whereNotNull('expiry_date')])->get();

        $partnerRows = $partners->map(function (CustomerPartner $p) use ($today, $soon) {
            $docs = $p->documents;
            $expired = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
            $expiring = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

            return [
                'id' => $p->id,
                'name' => $p->name,
                'customer_name' => $p->customer?->user?->name ?? '-',
                'renewals' => $expired + $expiring,
                'total_docs' => $docs->count(),
            ];
        })->values();

        // ── Manager summary ──
        $managers = User::role('manager')
            ->with('employee:id,user_id,department,designation')
            ->get();

        $managerRows = $managers->map(function (User $m) use ($today) {
            $total = Task::where('responsible_id', $m->id)->count();
            $completed = Task::where('responsible_id', $m->id)->where('status', 'completed')->count();
            $active = Task::where('responsible_id', $m->id)->whereIn('status', ['pending', 'in_progress'])->count();
            $overdue = Task::where('responsible_id', $m->id)->where('status', '!=', 'completed')->where('due_date', '<', $today)->count();

            return [
                'id' => $m->id,
                'name' => $m->name,
                'department' => $m->employee?->department ?? '-',
                'total_tasks' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'active_tasks' => $active,
                'overdue' => $overdue,
            ];
        })->values();

        // ── Employee summary ──
        $employees = User::role('employee')
            ->with('employee:id,user_id,department,designation')
            ->get();

        $employeeRows = $employees->map(function (User $e) use ($today) {
            $total = Task::where('responsible_id', $e->id)->count();
            $completed = Task::where('responsible_id', $e->id)->where('status', 'completed')->count();
            $active = Task::where('responsible_id', $e->id)->whereIn('status', ['pending', 'in_progress'])->count();
            $overdue = Task::where('responsible_id', $e->id)->where('status', '!=', 'completed')->where('due_date', '<', $today)->count();

            return [
                'id' => $e->id,
                'name' => $e->name,
                'department' => $e->employee?->department ?? '-',
                'designation' => $e->employee?->designation ?? '-',
                'total_tasks' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'active_tasks' => $active,
                'overdue' => $overdue,
            ];
        })->values();

        // ── Overall KPIs ──
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'completed')->count();
        $pendingTasks = Task::where('status', 'pending')->count();
        $inProgressTasks = Task::where('status', 'in_progress')->count();
        $overdueTasks = Task::where('status', '!=', 'completed')->where('due_date', '<', $today)->count();

        $allDocs = CustomerDocument::whereNotNull('expiry_date')->get();
        $totalRenewals = $allDocs->filter(fn ($d) => $d->expiry_date->lte($soon))->count();
        $expiredDocs = $allDocs->filter(fn ($d) => $d->expiry_date->lt($today))->count();

        return Inertia::render('Admin/Reports/Dashboard', [
            'kpis' => [
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
                'in_progress_tasks' => $inProgressTasks,
                'overdue_tasks' => $overdueTasks,
                'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0,
                'total_customers' => $customers->count(),
                'total_employees' => $employees->count(),
                'total_managers' => $managers->count(),
                'total_services' => $services->count(),
                'active_services' => $services->where('is_active', true)->count(),
                'total_renewals' => $totalRenewals,
                'expired_docs' => $expiredDocs,
            ],
            'services' => $serviceRows,
            'customers' => $customerRows,
            'partners' => $partnerRows,
            'managers' => $managerRows,
            'employees' => $employeeRows,
        ]);
    }

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

    // ── Customer Detail ──────────────────────────────────────

    public function customerShow(Customer $customer): Response
    {
        $today = Carbon::today();
        $soon = $today->copy()->addDays(30);

        $customer->load(['user', 'partners.documents.documentType', 'documents.documentType']);

        // ── Services used by this customer (via tasks) ──
        $tasks = Task::where('customer_id', $customer->id)
            ->with(['service:id,name,is_active', 'responsible.employee:id,user_id,department,designation', 'creator:id,name'])
            ->get();

        $serviceGroups = $tasks->groupBy('service_id')->map(function ($serviceTasks, $serviceId) use ($today) {
            $service = $serviceTasks->first()->service;
            $total = $serviceTasks->count();
            $completed = $serviceTasks->where('status', 'completed')->count();
            $pending = $serviceTasks->where('status', 'pending')->count();
            $inProgress = $serviceTasks->where('status', 'in_progress')->count();
            $overdue = $serviceTasks->filter(fn ($t) => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today))->count();

            // Collect unique employees/managers involved
            $people = $serviceTasks->map(fn ($t) => $t->responsible)->filter()->unique('id');

            return [
                'service_id' => $serviceId,
                'service_name' => $service?->name ?? 'Unknown',
                'is_active' => $service?->is_active ?? false,
                'total' => $total,
                'completed' => $completed,
                'pending' => $pending,
                'in_progress' => $inProgress,
                'overdue' => $overdue,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'assigned_to' => $people->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'role' => $u->roles->first()?->name ?? '-',
                    'department' => $u->employee?->department ?? '-',
                ])->values(),
                'tasks' => $serviceTasks->map(fn (Task $t) => [
                    'id' => $t->id,
                    'status' => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date?->format('M d, Y'),
                    'responsible_name' => $t->responsible?->name ?? '-',
                    'is_overdue' => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today),
                ])->values(),
            ];
        })->values();

        // ── Partners ──
        $partnerRows = $customer->partners->map(function (CustomerPartner $p) use ($today, $soon) {
            $docs = $p->documents->whereNotNull('expiry_date');
            $expired = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
            $expiring = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

            return [
                'id' => $p->id,
                'name' => $p->name,
                'total_docs' => $p->documents->count(),
                'renewals' => $expired + $expiring,
            ];
        })->values();

        // ── People involved (unique employees + managers from all tasks) ──
        $allPeople = $tasks->map(fn ($t) => $t->responsible)->filter()->unique('id');
        $peopleRows = $allPeople->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'role' => $u->roles->first()?->name ?? '-',
            'department' => $u->employee?->department ?? '-',
            'designation' => $u->employee?->designation ?? '-',
            'tasks_count' => $tasks->where('responsible_id', $u->id)->count(),
            'completed_count' => $tasks->where('responsible_id', $u->id)->where('status', 'completed')->count(),
        ])->values();

        // ── Document renewals ──
        $docs = $customer->documents->whereNotNull('expiry_date');
        $expiredDocs = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
        $expiringDocs = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

        // ── KPIs ──
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'completed')->count();

        return Inertia::render('Admin/Reports/CustomerShow', [
            'customer' => [
                'id' => $customer->user_id,
                'name' => $customer->user?->name ?? '-',
                'email' => $customer->user?->email ?? '-',
                'phone' => $customer->phone ?? '-',
                'emirate' => $customer->emirate ?? '-',
                'legal_type' => $customer->legal_type ?? '-',
                'trade_license_no' => $customer->trade_license_no ?? '-',
            ],
            'kpis' => [
                'total_tasks' => $totalTasks,
                'completed' => $completedTasks,
                'pending' => $tasks->where('status', 'pending')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'overdue' => $tasks->filter(fn ($t) => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today))->count(),
                'rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0,
                'renewals' => $expiredDocs + $expiringDocs,
                'expired_docs' => $expiredDocs,
            ],
            'services' => $serviceGroups,
            'partners' => $partnerRows,
            'people' => $peopleRows,
        ]);
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

    public function employeesPerformancePdf(Request $request)
    {
        $employees = $this->getAllEmployeesPerformanceData($request);
        $filtersMeta = $this->buildFiltersMeta($this->employeeFilters($request));

        $pdf = Pdf::loadView('reports.employees-performance', compact('employees', 'filtersMeta'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('all-employees-performance-' . now()->format('Y-m-d') . '.pdf');
    }

    public function employeesPerformanceExcel(Request $request)
    {
        $employees = $this->getAllEmployeesPerformanceData($request);

        return Excel::download(new AllEmployeesPerformanceExport($employees), 'all-employees-performance-' . now()->format('Y-m-d') . '.xlsx');
    }

    private function getAllEmployeesPerformanceData(Request $request): array
    {
        $search = $request->query('search');
        $department = $request->query('department');
        $period = $request->query('period', '90');
        $dateFrom = $this->getDateFrom($period);

        $users = User::role('employee')
            ->with('employee:id,user_id,department,designation,date_of_joining')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ->when($department, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('department', $department)))
            ->get();

        return $users->map(function (User $user) use ($dateFrom) {
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

            $priorityBreakdown = Task::where('responsible_id', $user->id)
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
                ->selectRaw('priority, count(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
                ->groupBy('priority')
                ->get()
                ->map(fn ($row) => [
                    'name' => ucfirst($row->priority),
                    'total' => $row->total,
                    'completed' => $row->completed,
                ])->toArray();

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
                ])->toArray();

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
                ])->toArray();

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
            ];
        })->toArray();
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

    // ── Employee Out (Onsite) Report ──────────────────────────

    public function employeeOut(Request $request): Response
    {
        $month = $request->query('month', now()->format('Y-m'));
        $search = $request->query('search');
        $startOfMonth = Carbon::parse($month . '-01')->startOfMonth();

        return Inertia::render('Admin/Reports/EmployeeOut', [
            'records' => $this->getEmployeeOutRecords($request),
            'filters' => [
                'month' => $month,
                'search' => $search,
            ],
            'month_label' => $startOfMonth->format('F Y'),
        ]);
    }

    public function employeeOutPdf(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $records = $this->getEmployeeOutRecords($request)->toArray();
        $monthLabel = Carbon::parse($month . '-01')->format('F Y');

        $pdf = Pdf::loadView('reports.employee-out', compact('records', 'monthLabel'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('employee-out-report-' . $month . '.pdf');
    }

    public function employeeOutExcel(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $records = $this->getEmployeeOutRecords($request)->toArray();

        return Excel::download(
            new EmployeeOutExport($records),
            'employee-out-report-' . $month . '.xlsx'
        );
    }

    private function getEmployeeOutRecords(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $search = $request->query('search');

        $startOfMonth = Carbon::parse($month . '-01')->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $events = CalendarEvent::with(['creator', 'participants'])
            ->where('type', 'onsite')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->whereHas('creator', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                      ->orWhereHas('participants', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return $events->map(function (CalendarEvent $event) use ($search) {
            $people = collect([$event->creator])->merge($event->participants)->unique('id');

            if ($search) {
                $people = $people->filter(fn ($user) => str_contains(strtolower($user->name), strtolower($search)));
            }

            return $people->map(fn ($user) => [
                'id' => $event->id . '-' . $user->id,
                'date' => $event->date->format('Y-m-d'),
                'date_display' => $event->date->format('D, M d, Y'),
                'employee_name' => $user->name,
                'status' => 'Onsite',
                'location' => $event->location ?? '-',
                'timing' => $event->all_day
                    ? 'All Day'
                    : ($event->start_time && $event->end_time
                        ? Carbon::parse($event->start_time)->format('h:i A') . ' - ' . Carbon::parse($event->end_time)->format('h:i A')
                        : '-'),
                'reason' => $event->reason ?? '-',
            ]);
        })->flatten(1)->values();
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
