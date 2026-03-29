<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Service;
use App\Models\Task;
use App\Models\ServiceSubmission;
use App\Models\User;
use App\Notifications\Task\TaskCompleted;
use App\Notifications\Task\TaskCreated;
use App\Notifications\Task\TaskDeleted;
use App\Notifications\Task\TaskReassigned;
use App\Notifications\Task\TaskStatusChanged;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->can('assign tasks') || $user->can('view tasks'), 403);

        $status = $request->query('status');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'created_at');
        $sortDirection = $request->query('direction', 'desc');
        $perPage = (int) $request->query('per_page', 15);

        $allowedSorts = ['due_date', 'created_at', 'priority', 'status'];
        if (! in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        if (! in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $baseQuery = Task::visibleTo($user);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'overdue' => (clone $baseQuery)->where('status', '!=', 'completed')->where('due_date', '<', now()->toDateString())->count(),
        ];

        $tasks = Task::visibleTo($user)
            ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
            ->when($status, function ($q) use ($status) {
                if ($status === 'overdue') {
                    $q->where('status', '!=', 'completed')->where('due_date', '<', now()->toDateString());
                } else {
                    $q->where('status', $status);
                }
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sq) use ($search) {
                    $sq->whereHas('service', fn ($s) => $s->where('name', 'like', "%{$search}%"))
                       ->orWhereHas('customer', fn ($c) => $c->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")))
                       ->orWhereHas('responsible', fn ($r) => $r->where('name', 'like', "%{$search}%"))
                       ->orWhere('instructions', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        $tasks->through(fn (Task $task) => [
            'id' => $task->id,
            'service_name' => $task->service?->name ?? 'Deleted Service',
            'customer_name' => $task->customer?->user?->name ?? 'Deleted Customer',
            'responsible_name' => $task->responsible?->name ?? 'Deleted User',
            'priority' => $task->priority,
            'status' => $task->status,
            'due_date' => $task->due_date->format('M d, Y'),
            'created_at' => $task->created_at->format('M d, Y'),
            'is_overdue' => $task->status !== 'completed' && $task->due_date->isPast(),
        ]);

        $viewMode = $request->query('view', 'list');
        $boardTasks = null;

        if ($viewMode === 'board') {
            $transform = fn (Task $t) => [
                'id' => $t->id,
                'service_name' => $t->service?->name ?? 'Deleted Service',
                'customer_name' => $t->customer?->user?->name ?? 'Deleted Customer',
                'responsible_name' => $t->responsible?->name ?? 'Deleted User',
                'priority' => $t->priority,
                'due_date' => $t->due_date->format('M d, Y'),
                'is_overdue' => $t->status !== 'completed' && $t->due_date->isPast(),
            ];

            $boardTasks = [
                'pending' => Task::visibleTo($user)->where('status', 'pending')
                    ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
                    ->orderBy('due_date')->limit(50)->get()->map($transform)->values(),
                'in_progress' => Task::visibleTo($user)->where('status', 'in_progress')
                    ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
                    ->orderBy('due_date')->limit(50)->get()->map($transform)->values(),
                'completed' => Task::visibleTo($user)->where('status', 'completed')
                    ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name'])
                    ->latest()->limit(20)->get()->map($transform)->values(),
            ];
        }

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
                'view' => $viewMode,
            ],
            'counts' => $counts,
            'can_create' => $user->can('assign tasks'),
            'board_tasks' => $boardTasks,
        ]);
    }

    public function create(): Response
    {
        abort_unless(auth()->user()->can('assign tasks'), 403);

        return Inertia::render('Tasks/Create', [
            'services' => Service::where('is_active', true)->get(['id', 'name']),
            'customers' => Customer::with('user:id,name')->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->user?->name ?? 'Unknown',
            ]),
            'employees' => User::role('employee')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('assign tasks'), 403);

        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'customer_id' => 'required|exists:customers,id',
            'responsible_id' => 'required|exists:users,id',
            'collaborator_ids' => 'nullable|array',
            'collaborator_ids.*' => 'exists:users,id',
            'due_date' => 'required|date|after_or_equal:today',
            'priority' => 'required|in:' . implode(',', Task::PRIORITIES),
            'instructions' => 'nullable|string|max:5000',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|max:20480|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
        ]);

        $task = Task::create([
            'created_by' => auth()->id(),
            'service_id' => $validated['service_id'],
            'customer_id' => $validated['customer_id'],
            'responsible_id' => $validated['responsible_id'],
            'priority' => $validated['priority'],
            'status' => 'pending',
            'due_date' => $validated['due_date'],
            'instructions' => $validated['instructions'] ?? null,
        ]);

        if (! empty($validated['collaborator_ids'])) {
            $task->collaborators()->sync($validated['collaborator_ids']);
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store("task-attachments/{$task->id}", 'public');
                $task->attachments()->create([
                    'uploaded_by' => auth()->id(),
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Notify responsible user and collaborators
        $task->load(['service:id,name', 'customer.user:id,name', 'creator:id,name', 'responsible:id,name']);
        $recipients = collect();

        if ($task->responsible && $task->responsible_id !== auth()->id()) {
            $recipients->push($task->responsible);
        }

        if (! empty($validated['collaborator_ids'])) {
            $collaborators = User::whereIn('id', $validated['collaborator_ids'])
                ->where('id', '!=', auth()->id())
                ->get();
            $recipients = $recipients->merge($collaborators);
        }

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients->unique('id'), new TaskCreated($task));
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Task created successfully.');
    }

    public function show(Task $task): Response
    {
        $this->authorizeTaskView($task);

        $task->load([
            'creator:id,name',
            'service:id,name,form_schema,completion_schema',
            'customer.user:id,name',
            'responsible:id,name',
            'collaborators:id,name',
            'attachments.uploader:id,name',
            'comments.user:id,name',
            'parentTask:id',
            'followUpTasks:id,status,due_date',
        ]);

        $user = auth()->user();

        $submission = null;
        $hasDraft = false;

        if ($task->status === 'completed') {
            $sub = ServiceSubmission::where('task_id', $task->id)->first();
            if ($sub) {
                $submission = [
                    'form_data' => $sub->form_data,
                    'status' => $sub->status,
                    'created_at' => $sub->created_at->format('M d, Y H:i'),
                ];
            }
        } elseif ($task->status === 'in_progress') {
            $hasDraft = ServiceSubmission::where('task_id', $task->id)->where('status', 'draft')->exists();
        }

        return Inertia::render('Tasks/Show', [
            'task' => [
                'id' => $task->id,
                'service_id' => $task->service_id,
                'service_name' => $task->service?->name ?? 'Deleted Service',
                'customer_id' => $task->customer_id,
                'customer_name' => $task->customer?->user?->name ?? 'Deleted Customer',
                'responsible_id' => $task->responsible_id,
                'responsible_name' => $task->responsible?->name ?? 'Deleted User',
                'collaborators' => $task->collaborators->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'can_work' => (bool) $c->pivot->can_work,
                ]),
                'priority' => $task->priority,
                'status' => $task->status,
                'due_date' => $task->due_date->format('Y-m-d'),
                'due_date_display' => $task->due_date->format('M d, Y'),
                'is_overdue' => $task->status !== 'completed' && $task->due_date->isPast(),
                'instructions' => $task->instructions,
                'created_by_name' => $task->creator?->name ?? 'Deleted User',
                'created_at' => $task->created_at->format('M d, Y'),
                'attachments' => $task->attachments->map(fn ($att) => [
                    'id' => $att->id,
                    'original_name' => $att->original_name,
                    'url' => Storage::disk('public')->url($att->file_path),
                    'mime_type' => $att->mime_type,
                    'file_size' => $att->file_size,
                    'uploaded_by_name' => $att->uploader?->name ?? 'Deleted User',
                    'uploaded_at' => $att->created_at->format('M d, Y'),
                    'can_delete' => $att->uploaded_by === $user->id || $user->hasRole('admin'),
                ]),
                'comments' => $task->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'body' => $c->body,
                    'user_name' => $c->user?->name ?? 'Deleted User',
                    'user_initials' => collect(explode(' ', $c->user?->name ?? 'DU'))->map(fn ($n) => $n[0] ?? '')->join(''),
                    'created_at' => $c->created_at->diffForHumans(),
                    'can_delete' => $c->user_id === $user->id || $user->hasRole('admin'),
                ]),
                'can_edit' => $task->created_by === $user->id || $user->hasRole('admin'),
                'can_update_status' => $task->responsible_id === $user->id || $user->hasRole('admin'),
                'can_add_attachments' => true,
                'has_draft' => $hasDraft,
                'parent_task_id' => $task->parent_task_id,
                'follow_up_tasks' => $task->followUpTasks->map(fn ($ft) => [
                    'id' => $ft->id,
                    'status' => $ft->status,
                    'due_date' => $ft->due_date->format('M d, Y'),
                ]),
                'can_work_on_task' => $task->canUserWork($user),
                'can_manage_collaborators' => $task->responsible_id === $user->id || $user->hasRole('admin'),
            ],
            'submission' => $submission,
            'form_schema' => $task->service?->form_schema ?? [],
            'completion_schema' => $task->service?->completion_schema ?? [],
            'employees' => ($task->responsible_id === $user->id || $user->hasRole('admin'))
                ? User::role('employee')->get(['id', 'name'])
                : [],
            'queries' => $task->queries()
                ->with(['raisedBy:id,name', 'directedTo:id,name'])
                ->withCount('responses')
                ->latest()
                ->get()
                ->map(fn ($q) => [
                    'id' => $q->id,
                    'subject' => $q->subject,
                    'priority' => $q->priority,
                    'status' => $q->status,
                    'raised_by_name' => $q->raisedBy?->name ?? 'Unknown',
                    'directed_to_name' => $q->directedTo?->name ?? null,
                    'responses_count' => $q->responses_count,
                    'created_at' => $q->created_at->diffForHumans(),
                ]),
            'open_queries_count' => $task->queries()->where('status', '!=', 'closed')->count(),
            'task_participants' => $this->getTaskParticipants($task),
        ]);
    }

    public function edit(Task $task): Response
    {
        $user = auth()->user();
        abort_unless($task->created_by === $user->id || $user->hasRole('admin'), 403);

        $task->load(['collaborators:id', 'attachments']);

        return Inertia::render('Tasks/Edit', [
            'task' => [
                'id' => $task->id,
                'service_id' => $task->service_id,
                'customer_id' => $task->customer_id,
                'responsible_id' => $task->responsible_id,
                'collaborator_ids' => $task->collaborators->pluck('id'),
                'priority' => $task->priority,
                'due_date' => $task->due_date->format('Y-m-d'),
                'instructions' => $task->instructions,
                'attachments' => $task->attachments->map(fn ($att) => [
                    'id' => $att->id,
                    'original_name' => $att->original_name,
                    'url' => Storage::disk('public')->url($att->file_path),
                ]),
            ],
            'services' => Service::where('is_active', true)->get(['id', 'name']),
            'customers' => Customer::with('user:id,name')->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->user?->name ?? 'Unknown',
            ]),
            'employees' => User::role('employee')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->created_by === $user->id || $user->hasRole('admin'), 403);

        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'customer_id' => 'required|exists:customers,id',
            'responsible_id' => 'required|exists:users,id',
            'collaborator_ids' => 'nullable|array',
            'collaborator_ids.*' => 'exists:users,id',
            'due_date' => 'required|date',
            'priority' => 'required|in:' . implode(',', Task::PRIORITIES),
            'instructions' => 'nullable|string|max:5000',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|max:20480|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
            'remove_attachment_ids' => 'nullable|array',
            'remove_attachment_ids.*' => 'integer|exists:task_attachments,id',
        ]);

        $oldResponsibleId = $task->responsible_id;

        $task->update([
            'service_id' => $validated['service_id'],
            'customer_id' => $validated['customer_id'],
            'responsible_id' => $validated['responsible_id'],
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'],
            'instructions' => $validated['instructions'] ?? null,
        ]);

        $task->collaborators()->sync($validated['collaborator_ids'] ?? []);

        // Notify if responsible person changed
        if ($oldResponsibleId !== (int) $validated['responsible_id']) {
            $oldResponsible = User::find($oldResponsibleId);
            $newResponsible = User::find($validated['responsible_id']);

            if ($oldResponsible && $newResponsible) {
                $task->load(['service:id,name']);
                $recipients = collect([$oldResponsible, $newResponsible])
                    ->filter(fn ($u) => $u->id !== auth()->id());

                if ($recipients->isNotEmpty()) {
                    Notification::send($recipients, new TaskReassigned($task, $oldResponsible, $newResponsible));
                }
            }
        }

        // Remove attachments
        if (! empty($validated['remove_attachment_ids'])) {
            $attachments = $task->attachments()->whereIn('id', $validated['remove_attachment_ids'])->get();
            foreach ($attachments as $att) {
                Storage::disk('public')->delete($att->file_path);
                $att->delete();
            }
        }

        // Add new attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store("task-attachments/{$task->id}", 'public');
                $task->attachments()->create([
                    'uploaded_by' => auth()->id(),
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Task updated successfully.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->responsible_id === $user->id || $user->hasRole('admin'), 403);

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', Task::STATUSES),
        ]);

        $statusOrder = array_flip(Task::STATUSES);
        if (! $user->hasRole('admin') && $statusOrder[$validated['status']] <= $statusOrder[$task->status]) {
            return back()->with('error', 'Cannot move task to a previous status.');
        }

        $oldStatus = $task->status;
        $task->update(['status' => $validated['status']]);

        // Notify task participants of status change
        $task->load(['service:id,name', 'customer.user:id,name', 'responsible:id,name,email', 'collaborators:id,name,email', 'creator:id,name,email']);
        $recipients = $this->getNotifiableUsers($task);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new TaskStatusChanged($task, $oldStatus, $validated['status']));
        }

        return back()->with('success', 'Task status updated.');
    }

    public function complete(Task $task): Response
    {
        $user = auth()->user();
        abort_unless($task->canUserWork($user), 403);
        abort_if($task->status === 'completed', 403, 'Task is already completed.');

        $task->load(['service.documentTypes:id,name,has_expiry,has_file,has_value', 'customer.user:id,name', 'customer.documents.documentType', 'customerDocument.documentType:id,name']);

        // Auto-transition to in_progress if pending
        if ($task->status === 'pending') {
            $task->update(['status' => 'in_progress']);
        }

        $draft = ServiceSubmission::where('task_id', $task->id)->where('status', 'draft')->first();

        // Linked document info (for auto-created expiry tasks)
        $linkedDocument = null;
        if ($task->customerDocument) {
            $doc = $task->customerDocument;
            $linkedDocument = [
                'id' => $doc->id,
                'document_type_name' => $doc->documentType?->name ?? 'Document',
                'current_value' => $doc->value,
                'current_file_url' => $doc->file_path ? Storage::disk('public')->url($doc->file_path) : null,
                'current_issue_date' => $doc->issue_date?->format('Y-m-d'),
                'current_expiry_date' => $doc->expiry_date?->format('Y-m-d'),
                'has_expiry' => $doc->documentType?->has_expiry ?? false,
                'has_file' => $doc->documentType?->has_file ?? false,
                'has_value' => $doc->documentType?->has_value ?? false,
            ];
        }

        // Auto-fill customer documents linked to this service (both work and completion phases)
        $requiredDocTypes = $task->service?->documentTypes ?? collect();
        $customerDocs = $task->customer?->documents ?? collect();
        $today = now()->startOfDay();

        $customerDocuments = $requiredDocTypes->map(function ($docType) use ($customerDocs, $today) {
            $doc = $customerDocs->firstWhere('document_type_id', $docType->id);
            $isExpired = $doc?->expiry_date && $doc->expiry_date->lt($today);
            $isExpiringSoon = $doc?->expiry_date && ! $isExpired && $doc->expiry_date->lte($today->copy()->addDays(30));

            return [
                'document_type_id' => $docType->id,
                'document_type_name' => $docType->name,
                'category' => $docType->category,
                'phase' => $docType->pivot->phase ?? 'work',
                'has_file' => $docType->has_file,
                'has_value' => $docType->has_value,
                'has_expiry' => $docType->has_expiry,
                'is_required' => $docType->pivot->is_required ?? true,
                'found' => $doc !== null,
                'value' => $doc?->value,
                'file_url' => $doc?->file_path ? Storage::disk('public')->url($doc->file_path) : null,
                'original_name' => $doc?->original_name,
                'issue_date' => $doc?->issue_date?->format('M d, Y'),
                'expiry_date' => $doc?->expiry_date?->format('M d, Y'),
                'is_expired' => $isExpired,
                'is_expiring_soon' => $isExpiringSoon,
            ];
        });

        return Inertia::render('Tasks/Complete', [
            'task' => [
                'id' => $task->id,
                'service_name' => $task->service?->name ?? 'Deleted Service',
                'customer_name' => $task->customer?->user?->name ?? 'Deleted Customer',
                'instructions' => $task->instructions,
                'status' => $task->status,
                'due_date_display' => $task->due_date->format('M d, Y'),
                'priority' => $task->priority,
            ],
            'form_schema' => $task->service?->form_schema ?? [],
            'completion_schema' => $task->service?->completion_schema ?? [],
            'draft_data' => $draft?->form_data['form_data'] ?? $draft?->form_data ?? (object) [],
            'draft_completion_data' => $draft?->form_data['completion_data'] ?? (object) [],
            'linked_document' => $linkedDocument,
            'customer_documents' => $customerDocuments,
        ]);
    }

    public function saveDraft(Request $request, Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->canUserWork($user), 403);
        abort_if($task->status === 'completed', 403, 'Task is already completed.');

        if ($task->status === 'pending') {
            $task->update(['status' => 'in_progress']);
        }

        $formSchema = $task->service?->form_schema ?? [];
        $completionSchema = $task->service?->completion_schema ?? [];
        $submissionData = $request->input('form_data', []);
        $completionData = $request->input('completion_data', []);

        // Handle file uploads for both schemas
        foreach ($formSchema as $field) {
            if (in_array($field['type'], ['file', 'image']) && $request->hasFile('form_data.' . $field['name'])) {
                $file = $request->file('form_data.' . $field['name']);
                $path = $file->store("service-submissions/{$task->service_id}", 'public');
                $submissionData[$field['name']] = $path;
            }
        }
        foreach ($completionSchema as $field) {
            if (in_array($field['type'], ['file', 'image']) && $request->hasFile('completion_data.' . $field['name'])) {
                $file = $request->file('completion_data.' . $field['name']);
                $path = $file->store("service-submissions/{$task->service_id}", 'public');
                $completionData[$field['name']] = $path;
            }
        }

        $draftPayload = ['form_data' => $submissionData, 'completion_data' => $completionData];

        $draft = ServiceSubmission::where('task_id', $task->id)->where('status', 'draft')->first();

        if ($draft) {
            $existing = $draft->form_data ?? [];
            $merged = [
                'form_data' => array_merge($existing['form_data'] ?? $existing, $submissionData),
                'completion_data' => array_merge($existing['completion_data'] ?? [], $completionData),
            ];
            $draft->update(['form_data' => $merged]);
        } else {
            ServiceSubmission::create([
                'service_id' => $task->service_id,
                'user_id' => $user->id,
                'task_id' => $task->id,
                'form_data' => $draftPayload,
                'status' => 'draft',
            ]);
        }

        return back()->with('success', 'Draft saved successfully.');
    }

    public function submitCompletion(Request $request, Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->canUserWork($user), 403);
        abort_if($task->status === 'completed', 403, 'Task is already completed.');

        $service = $task->service;
        abort_unless($service, 404, 'Task has no associated service.');

        $formSchema = $service->form_schema ?? [];
        $completionSchema = $service->completion_schema ?? [];
        $draft = ServiceSubmission::where('task_id', $task->id)->where('status', 'draft')->first();
        $draftData = $draft?->form_data ?? [];
        $rules = [];

        // Build validation rules for both schemas
        $this->buildFieldRules($formSchema, 'form_data', $draftData, $rules);
        $this->buildFieldRules($completionSchema, 'completion_data', [], $rules);

        // Follow-up task fields
        $rules['followup_due_date'] = 'nullable|date|after:today';
        $rules['followup_start_date'] = 'nullable|date';
        $rules['followup_notes'] = 'nullable|string|max:1000';

        // Linked document update fields (for expiry-triggered tasks)
        if ($task->customer_document_id) {
            $rules['doc_update_value'] = 'nullable|string|max:255';
            $rules['doc_update_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['doc_update_issue_date'] = 'nullable|date';
            $rules['doc_update_expiry_date'] = 'nullable|date|after:doc_update_issue_date';
        }

        // Work & completion phase document updates
        $rules['work_doc_updates'] = 'nullable|array';
        $rules['work_doc_updates.*.value'] = 'nullable|string|max:255';
        $rules['work_doc_updates.*.file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
        $rules['work_doc_updates.*.issue_date'] = 'nullable|date';
        $rules['work_doc_updates.*.expiry_date'] = 'nullable|date';
        $rules['work_doc_updates.*.update_profile'] = 'nullable';
        $rules['completion_doc_updates'] = 'nullable|array';
        $rules['completion_doc_updates.*.value'] = 'nullable|string|max:255';
        $rules['completion_doc_updates.*.file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
        $rules['completion_doc_updates.*.issue_date'] = 'nullable|date';
        $rules['completion_doc_updates.*.expiry_date'] = 'nullable|date';
        $rules['completion_doc_updates.*.update_profile'] = 'nullable';

        $validated = $request->validate($rules);
        $submissionData = $validated['form_data'] ?? [];
        $completionData = $validated['completion_data'] ?? [];

        // Handle file uploads for work form
        $this->processFileUploads($formSchema, 'form_data', $request, $task->service_id, $submissionData, $draftData);

        // Handle file uploads for completion form
        $this->processFileUploads($completionSchema, 'completion_data', $request, $task->service_id, $completionData, []);

        $finalData = [
            'form_data' => $submissionData,
            'completion_data' => $completionData,
        ];

        if ($draft) {
            $draft->update([
                'form_data' => $finalData,
                'status' => 'submitted',
            ]);
        } else {
            ServiceSubmission::create([
                'service_id' => $task->service_id,
                'user_id' => $user->id,
                'task_id' => $task->id,
                'form_data' => $finalData,
                'status' => 'submitted',
            ]);
        }

        $task->update(['status' => 'completed']);

        // Update linked customer document if data provided
        if ($task->customer_document_id) {
            $doc = $task->customerDocument;
            if ($doc) {
                $updateData = [];

                if (! empty($validated['doc_update_value'])) {
                    $updateData['value'] = $validated['doc_update_value'];
                }
                if (! empty($validated['doc_update_issue_date'])) {
                    $updateData['issue_date'] = $validated['doc_update_issue_date'];
                }
                if (! empty($validated['doc_update_expiry_date'])) {
                    $updateData['expiry_date'] = $validated['doc_update_expiry_date'];
                }
                if ($request->hasFile('doc_update_file')) {
                    if ($doc->file_path) {
                        Storage::disk('public')->delete($doc->file_path);
                    }
                    $file = $request->file('doc_update_file');
                    $updateData['file_path'] = $file->store("customer-documents/{$doc->customer_id}", 'public');
                    $updateData['original_name'] = $file->getClientOriginalName();
                }

                if (! empty($updateData)) {
                    $doc->update($updateData);
                }
            }
        }

        // Process work & completion phase document updates
        $allDocUpdates = array_merge(
            $validated['work_doc_updates'] ?? [],
            $validated['completion_doc_updates'] ?? []
        );

        if (! empty($allDocUpdates) && $task->customer_id) {
            foreach ($allDocUpdates as $docTypeId => $docData) {
                $shouldUpdateProfile = ! empty($docData['update_profile']) && $docData['update_profile'] !== '0';
                if (! $shouldUpdateProfile) {
                    continue;
                }

                $hasAnyData = ! empty($docData['value']) || ! empty($docData['issue_date']) || ! empty($docData['expiry_date'])
                    || $request->hasFile("work_doc_updates.{$docTypeId}.file")
                    || $request->hasFile("completion_doc_updates.{$docTypeId}.file");

                if (! $hasAnyData) {
                    continue;
                }

                $customerDoc = CustomerDocument::firstOrNew([
                    'customer_id' => $task->customer_id,
                    'document_type_id' => $docTypeId,
                ]);

                if (! empty($docData['value'])) {
                    $customerDoc->value = $docData['value'];
                }
                if (! empty($docData['issue_date'])) {
                    $customerDoc->issue_date = $docData['issue_date'];
                }
                if (! empty($docData['expiry_date'])) {
                    $customerDoc->expiry_date = $docData['expiry_date'];
                }

                // Check both work and completion file keys
                $fileKey = $request->hasFile("work_doc_updates.{$docTypeId}.file")
                    ? "work_doc_updates.{$docTypeId}.file"
                    : "completion_doc_updates.{$docTypeId}.file";

                if ($request->hasFile($fileKey)) {
                    if ($customerDoc->file_path) {
                        Storage::disk('public')->delete($customerDoc->file_path);
                    }
                    $file = $request->file($fileKey);
                    $customerDoc->file_path = $file->store("customer-documents/{$task->customer_id}", 'public');
                    $customerDoc->original_name = $file->getClientOriginalName();
                }

                $customerDoc->save();
            }
        }

        // Create follow-up task if scheduled
        $successMessage = 'Task completed successfully.';
        if (! empty($validated['followup_due_date'])) {
            $instructions = '';
            if (! empty($validated['followup_start_date'])) {
                $instructions .= "Work start date: {$validated['followup_start_date']}\n";
            }
            if (! empty($validated['followup_notes'])) {
                $instructions .= $validated['followup_notes'];
            }
            $instructions .= "\n\nFollow-up from Task #{$task->id}.";

            $followUp = Task::create([
                'parent_task_id' => $task->id,
                'created_by' => $user->id,
                'service_id' => $task->service_id,
                'customer_id' => $task->customer_id,
                'responsible_id' => $task->responsible_id,
                'priority' => $task->priority,
                'status' => 'pending',
                'due_date' => $validated['followup_due_date'],
                'instructions' => trim($instructions),
            ]);

            // Copy collaborators to follow-up task
            $collaboratorData = $task->collaborators->mapWithKeys(fn ($c) => [
                $c->id => ['can_work' => $c->pivot->can_work],
            ])->all();
            if (! empty($collaboratorData)) {
                $followUp->collaborators()->sync($collaboratorData);
            }

            $successMessage = "Task completed. Follow-up Task #{$followUp->id} created (due {$validated['followup_due_date']}).";
        }

        // Notify task participants of completion
        $task->load(['service:id,name', 'customer.user:id,name,email', 'responsible:id,name,email', 'collaborators:id,name,email', 'creator:id,name,email']);
        $recipients = $this->getNotifiableUsers($task);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new TaskCompleted($task, $followUp ?? null));
        }

        return redirect()->route('tasks.show', $task)->with('success', $successMessage);
    }

    private function buildFieldRules(array $schema, string $prefix, array $draftData, array &$rules): void
    {
        foreach ($schema as $field) {
            $fieldName = $prefix . '.' . $field['name'];
            $fieldRules = [];
            $isFileField = in_array($field['type'], ['file', 'image']);

            if ($field['required'] ?? false) {
                if ($isFileField && ! empty($draftData[$field['name']])) {
                    $fieldRules[] = 'nullable';
                } else {
                    $fieldRules[] = 'required';
                }
            } else {
                $fieldRules[] = 'nullable';
            }

            switch ($field['type']) {
                case 'text':
                case 'textarea':
                    $fieldRules[] = 'string';
                    $fieldRules[] = 'max:5000';
                    break;
                case 'number':
                    $fieldRules[] = 'numeric';
                    break;
                case 'date':
                    $fieldRules[] = 'date';
                    break;
                case 'dropdown':
                    if (! empty($field['options'])) {
                        $fieldRules[] = 'in:' . implode(',', $field['options']);
                    }
                    break;
                case 'checkbox':
                    $fieldRules[] = 'boolean';
                    break;
                case 'file':
                case 'image':
                    $fieldRules[] = 'file';
                    $fieldRules[] = 'max:20480';
                    if ($field['type'] === 'image') {
                        $fieldRules[] = 'mimes:jpg,jpeg,png,gif,webp';
                    }
                    break;
            }

            $rules[$fieldName] = $fieldRules;
        }
    }

    private function processFileUploads(array $schema, string $prefix, Request $request, int $serviceId, array &$data, array $fallback): void
    {
        foreach ($schema as $field) {
            if (in_array($field['type'], ['file', 'image'])) {
                if ($request->hasFile($prefix . '.' . $field['name'])) {
                    $file = $request->file($prefix . '.' . $field['name']);
                    $path = $file->store("service-submissions/{$serviceId}", 'public');
                    $data[$field['name']] = $path;
                } elseif (! empty($fallback[$field['name']])) {
                    $data[$field['name']] = $fallback[$field['name']];
                }
            }
        }
    }

    public function addCollaborator(Request $request, Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->responsible_id === $user->id || $user->hasRole('admin'), 403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'can_work' => 'boolean',
        ]);

        if ($task->collaborators()->where('users.id', $validated['user_id'])->exists()) {
            return back()->with('error', 'User is already a collaborator.');
        }

        $task->collaborators()->attach($validated['user_id'], [
            'can_work' => $validated['can_work'] ?? false,
        ]);

        return back()->with('success', 'Collaborator added.');
    }

    public function removeCollaborator(Task $task, User $collaborator): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->responsible_id === $user->id || $user->hasRole('admin'), 403);

        $task->collaborators()->detach($collaborator->id);

        return back()->with('success', 'Collaborator removed.');
    }

    public function toggleCollaboratorWork(Request $request, Task $task, User $collaborator): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->responsible_id === $user->id || $user->hasRole('admin'), 403);

        $validated = $request->validate([
            'can_work' => 'required|boolean',
        ]);

        $task->collaborators()->updateExistingPivot($collaborator->id, [
            'can_work' => $validated['can_work'],
        ]);

        return back()->with('success', 'Collaborator permissions updated.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($task->created_by === $user->id || $user->hasRole('admin'), 403);

        // Collect notification data before deletion
        $task->load(['service:id,name', 'customer.user:id,name,email', 'responsible:id,name,email', 'collaborators:id,name,email']);
        $taskId = $task->id;
        $serviceName = $task->service?->name ?? 'N/A';
        $customerName = $task->customer?->user?->name ?? 'N/A';
        $deletedBy = $user->name;
        $recipients = $this->getNotifiableUsers($task);

        foreach ($task->attachments as $att) {
            Storage::disk('public')->delete($att->file_path);
        }

        $task->delete();

        // Notify after deletion
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new TaskDeleted($taskId, $serviceName, $customerName, $deletedBy));
        }

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }

    private function getTaskParticipants(Task $task): array
    {
        $participants = collect();

        if ($task->responsible) {
            $participants->push(['id' => $task->responsible->id, 'name' => $task->responsible->name, 'role' => 'Responsible']);
        }

        foreach ($task->collaborators as $c) {
            $participants->push(['id' => $c->id, 'name' => $c->name, 'role' => 'Collaborator']);
        }

        if ($task->customer?->user) {
            $participants->push(['id' => $task->customer->user->id, 'name' => $task->customer->user->name, 'role' => 'Client']);
        }

        // Add admins
        $admins = User::role('admin')->get(['id', 'name']);
        foreach ($admins as $admin) {
            if (!$participants->contains('id', $admin->id)) {
                $participants->push(['id' => $admin->id, 'name' => $admin->name, 'role' => 'Admin']);
            }
        }

        return $participants->values()->all();
    }

    private function getNotifiableUsers(Task $task): \Illuminate\Support\Collection
    {
        $currentUserId = auth()->id();

        $users = collect();

        if ($task->responsible && $task->responsible_id !== $currentUserId) {
            $users->push($task->responsible);
        }

        if ($task->creator && $task->created_by !== $currentUserId) {
            $users->push($task->creator);
        }

        foreach ($task->collaborators as $collaborator) {
            if ($collaborator->id !== $currentUserId) {
                $users->push($collaborator);
            }
        }

        if ($task->customer?->user && $task->customer->user->id !== $currentUserId) {
            $users->push($task->customer->user);
        }

        return $users->unique('id');
    }

    private function authorizeTaskView(Task $task): void
    {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return;
        }

        $isCreator = $task->created_by === $user->id;
        $isResponsible = $task->responsible_id === $user->id;
        $isCollaborator = $task->collaborators()->where('users.id', $user->id)->exists();
        $isClient = $task->customer && $task->customer->user_id === $user->id;

        if (! ($isCreator || $isResponsible || $isCollaborator || $isClient)) {
            abort(403, 'You do not have access to this task.');
        }
    }
}
