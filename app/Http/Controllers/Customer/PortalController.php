<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\Service;
use App\Models\ServiceSubmission;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    // ── Services ────────────────────────────────────────────

    public function services(Request $request): Response
    {
        $customer = $this->customerOrAbort($request);
        $search = $request->query('search');

        $services = Service::where('is_active', true)
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->get();

        $rows = $services->map(function (Service $s) use ($customer) {
            $myTasks = Task::where('service_id', $s->id)->where('customer_id', $customer->id);
            $running = (clone $myTasks)->whereIn('status', ['pending', 'in_progress'])->count();
            $completed = (clone $myTasks)->where('status', 'completed')->count();

            return [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'fields_count' => count($s->form_schema ?? []),
                'my_running' => $running,
                'my_completed' => $completed,
            ];
        })->values();

        return Inertia::render('Customer/Services/Index', [
            'services' => $rows,
            'filters' => ['search' => $search],
        ]);
    }

    public function serviceRequestForm(Request $request, Service $service): Response
    {
        $this->customerOrAbort($request);
        abort_unless($service->is_active, 404);

        return Inertia::render('Customer/Services/Request', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'form_schema' => $service->form_schema ?? [],
            ],
            'autofill' => $this->buildAutofillValues($request->user()),
        ]);
    }

    public function submitServiceRequest(Request $request, Service $service): RedirectResponse
    {
        $customer = $this->customerOrAbort($request);
        abort_unless($service->is_active, 404);

        $validated = $request->validate([
            'form_data' => 'nullable|array',
        ]);

        // Auto-assign to first admin
        $admin = User::role('admin')->first();
        abort_if(! $admin, 503, 'No admin available to receive the request.');

        $task = Task::create([
            'created_by' => $request->user()->id,
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'responsible_id' => $admin->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => Carbon::today()->addDays(14),
            'instructions' => "Service requested by {$request->user()->name}.",
        ]);

        ServiceSubmission::create([
            'service_id' => $service->id,
            'user_id' => $request->user()->id,
            'task_id' => $task->id,
            'form_data' => $validated['form_data'] ?? [],
            'status' => 'submitted',
        ]);

        return redirect()->route('customer.progress')
            ->with('success', "Your '{$service->name}' request has been submitted.");
    }

    // ── Track progress ──────────────────────────────────────

    public function progress(Request $request): Response
    {
        $customer = $this->customerOrAbort($request);
        $today = Carbon::today();

        $tasks = Task::where('customer_id', $customer->id)
            ->with(['service:id,name', 'responsible:id,name'])
            ->orderByDesc('created_at')
            ->get();

        $serviceGroups = $tasks->groupBy('service_id')->map(function ($group, $serviceId) use ($today) {
            $service = $group->first()->service;
            $total = $group->count();
            $completed = $group->where('status', 'completed')->count();

            return [
                'service_id' => $serviceId,
                'service_name' => $service?->name ?? 'Unknown',
                'total' => $total,
                'completed' => $completed,
                'pending' => $group->where('status', 'pending')->count(),
                'in_progress' => $group->where('status', 'in_progress')->count(),
                'overdue' => $group->filter(fn ($t) => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today))->count(),
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'tasks' => $group->map(fn (Task $t) => [
                    'id' => $t->id,
                    'status' => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date?->format('M d, Y'),
                    'responsible_name' => $t->responsible?->name ?? '-',
                    'is_overdue' => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today),
                    'created_at' => $t->created_at->format('M d, Y'),
                ])->values(),
            ];
        })->values();

        return Inertia::render('Customer/Progress', [
            'kpis' => [
                'total_tasks' => $tasks->count(),
                'completed' => $tasks->where('status', 'completed')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'pending' => $tasks->where('status', 'pending')->count(),
                'overdue' => $tasks->filter(fn ($t) => $t->status !== 'completed' && $t->due_date && $t->due_date->lt($today))->count(),
            ],
            'service_groups' => $serviceGroups,
        ]);
    }

    // ── Documents ───────────────────────────────────────────

    public function documents(Request $request): Response
    {
        $customer = $this->customerOrAbort($request);

        $docs = $customer->documents()->with(['documentType:id,name,category', 'partner:id,name', 'branch:id,name'])->orderByDesc('created_at')->get();

        return Inertia::render('Customer/Documents/Index', [
            'documents' => $docs->map(fn (CustomerDocument $d) => $this->formatDocument($d))->values(),
            'document_types' => DocumentType::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'category', 'has_expiry', 'has_file', 'has_value']),
            'partners' => $customer->partners()->get(['id', 'name']),
            'branches' => $customer->branches()->get(['id', 'name']),
        ]);
    }

    public function storeDocument(Request $request): RedirectResponse
    {
        $customer = $this->customerOrAbort($request);

        $validated = $request->validate([
            'document_type_id' => 'required|integer|exists:document_types,id',
            'partner_id' => 'nullable|integer|exists:customer_partners,id',
            'branch_id' => 'nullable|integer|exists:customer_branches,id',
            'value' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        // If partner/branch ids are provided, ensure they belong to this customer
        if (! empty($validated['partner_id'])) {
            abort_unless($customer->partners()->whereKey($validated['partner_id'])->exists(), 403);
        }
        if (! empty($validated['branch_id'])) {
            abort_unless($customer->branches()->whereKey($validated['branch_id'])->exists(), 403);
        }

        $payload = [
            'customer_id' => $customer->id,
            'document_type_id' => $validated['document_type_id'],
            'partner_id' => $validated['partner_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'value' => $validated['value'] ?? null,
            'issue_date' => $validated['issue_date'] ?? null,
            'expiry_date' => $validated['expiry_date'] ?? null,
        ];

        if ($request->hasFile('file')) {
            $stored = $request->file('file')->store("customer-documents/{$customer->id}", 'public');
            $payload['file_path'] = $stored;
            $payload['original_name'] = $request->file('file')->getClientOriginalName();
        }

        CustomerDocument::create($payload);

        return back()->with('success', 'Document uploaded.');
    }

    public function documentTracker(Request $request): Response
    {
        $customer = $this->customerOrAbort($request);
        $today = Carbon::today();
        $soon = $today->copy()->addDays(30);

        $docs = $customer->documents()
            ->whereNotNull('expiry_date')
            ->with(['documentType:id,name,category', 'partner:id,name', 'branch:id,name'])
            ->orderBy('expiry_date')
            ->get();

        $rows = $docs->map(function (CustomerDocument $d) use ($today) {
            $base = $this->formatDocument($d);
            $base['days_remaining'] = (int) $today->diffInDays($d->expiry_date, false);
            $base['bucket'] = $d->expiry_date->lt($today)
                ? 'expired'
                : ($d->expiry_date->lte($today->copy()->addDays(30)) ? 'expiring' : 'active');
            return $base;
        })->values();

        $expired = $rows->where('bucket', 'expired')->values();
        $expiring = $rows->where('bucket', 'expiring')->values();
        $active = $rows->where('bucket', 'active')->values();

        return Inertia::render('Customer/Documents/Tracker', [
            'kpis' => [
                'expired' => $expired->count(),
                'expiring' => $expiring->count(),
                'active' => $active->count(),
                'total' => $rows->count(),
            ],
            'expired' => $expired,
            'expiring' => $expiring,
            'active' => $active,
        ]);
    }

    // ── Reports ─────────────────────────────────────────────

    public function reports(Request $request): Response
    {
        $customer = $this->customerOrAbort($request);
        $today = Carbon::today();
        $soon = $today->copy()->addDays(30);

        // Service usage
        $tasks = Task::where('customer_id', $customer->id)->with('service:id,name')->get();
        $serviceUsage = $tasks->groupBy('service_id')->map(function ($group, $serviceId) {
            $total = $group->count();
            $completed = $group->where('status', 'completed')->count();

            return [
                'service_id' => $serviceId,
                'service_name' => $group->first()->service?->name ?? 'Unknown',
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
            ];
        })->sortByDesc('total')->values();

        // Document renewals
        $docs = $customer->documents()->whereNotNull('expiry_date')->get();
        $expiredDocs = $docs->filter(fn ($d) => $d->expiry_date->lt($today))->count();
        $expiringDocs = $docs->filter(fn ($d) => $d->expiry_date->gte($today) && $d->expiry_date->lte($soon))->count();

        // Monthly task completion (last 6 months)
        $sixMonthsAgo = Carbon::now()->subMonths(6)->startOfMonth();
        $monthly = Task::where('customer_id', $customer->id)
            ->where('status', 'completed')
            ->where('updated_at', '>=', $sixMonthsAgo)
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        $completionTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->subMonths($i);
            $completionTrend->push([
                'month' => $m->format('M'),
                'count' => $monthly[$m->format('Y-m')] ?? 0,
            ]);
        }

        // Recent activity (last 10 task status changes / creations)
        $recent = $tasks->sortByDesc('updated_at')->take(10)->map(fn (Task $t) => [
            'id' => $t->id,
            'service_name' => $t->service?->name ?? 'Unknown',
            'status' => $t->status,
            'timestamp' => $t->updated_at->diffForHumans(),
        ])->values();

        return Inertia::render('Customer/Reports', [
            'kpis' => [
                'total_tasks' => $tasks->count(),
                'completed_tasks' => $tasks->where('status', 'completed')->count(),
                'completion_rate' => $tasks->count() > 0 ? round(($tasks->where('status', 'completed')->count() / $tasks->count()) * 100) : 0,
                'total_documents' => $customer->documents()->count(),
                'expired_docs' => $expiredDocs,
                'expiring_docs' => $expiringDocs,
            ],
            'service_usage' => $serviceUsage,
            'completion_trend' => $completionTrend,
            'recent_activity' => $recent,
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────

    private function customerOrAbort(Request $request): Customer
    {
        $customer = $request->user()->customer;
        abort_unless($customer, 403, 'No customer profile linked to this account.');

        return $customer;
    }

    private function formatDocument(CustomerDocument $d): array
    {
        return [
            'id' => $d->id,
            'document_type' => $d->documentType?->name ?? '-',
            'document_type_id' => $d->document_type_id,
            'category' => $d->documentType?->category ?? '-',
            'value' => $d->value,
            'issue_date' => $d->issue_date?->format('M d, Y'),
            'expiry_date' => $d->expiry_date?->format('M d, Y'),
            'partner_name' => $d->partner?->name,
            'branch_name' => $d->branch?->name,
            'file_url' => $d->file_path ? Storage::disk('public')->url($d->file_path) : null,
            'original_name' => $d->original_name,
            'uploaded_at' => $d->created_at->format('M d, Y'),
        ];
    }

    private function buildAutofillValues(User $user): array
    {
        $customer = $user->customer;
        if (! $customer) return [];

        return [
            'customer.name' => $user->name,
            'customer.email' => $user->email,
            'customer.phone' => $customer->phone,
            'customer.trade_license_no' => $customer->trade_license_no,
            'customer.legal_type' => $customer->legal_type,
            'customer.issuing_authority' => $customer->issuing_authority,
            'customer.contact_person_name' => $customer->contact_person_name,
            'customer.address_line' => $customer->address_line,
            'customer.city' => $customer->city,
            'customer.emirate' => $customer->emirate,
            'customer.country' => $customer->country,
            'customer.po_box' => $customer->po_box,
            'customer.telephone' => $customer->telephone,
        ];
    }
}
