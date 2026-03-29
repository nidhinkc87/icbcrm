<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Models\Service;
use App\Models\ServiceSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $sortField = $request->query('sort', 'created_at');
        $sortDirection = $request->query('direction', 'desc');
        $perPage = (int) $request->query('per_page', 15);

        $allowedSorts = ['name', 'created_at', 'is_active'];
        if (! in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        if (! in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $services = Service::when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        $services->through(fn ($service) => [
            'id' => $service->id,
            'name' => $service->name,
            'is_active' => $service->is_active,
            'fields_count' => count($service->form_schema ?? []),
            'created_at' => $service->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'filters' => [
                'search' => $search,
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Services/Create', [
            'document_types' => DocumentType::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'category']),
            'autofill_sources' => $this->buildAutofillSources(),
        ]);
    }

    private function buildAutofillSources(): array
    {
        $sources = [];

        // Customer profile fields
        $customerFields = [
            'trade_license_no' => 'Trade License No',
            'legal_type' => 'Legal Type',
            'issuing_authority' => 'Issuing Authority',
            'contact_person_name' => 'Contact Person Name',
            'phone' => 'Phone',
            'telephone' => 'Telephone',
            'address_line' => 'Address',
            'city' => 'City',
            'emirate' => 'Emirate',
            'country' => 'Country',
            'po_box' => 'PO Box',
        ];

        foreach ($customerFields as $key => $label) {
            $sources[] = [
                'value' => "customer:{$key}",
                'label' => $label,
                'group' => 'Customer Profile',
            ];
        }

        // Bank detail fields
        $bankFields = [
            'bank_name' => 'Bank Name',
            'branch' => 'Bank Branch',
            'account_number' => 'Account Number',
            'iban' => 'IBAN',
        ];

        foreach ($bankFields as $key => $label) {
            $sources[] = [
                'value' => "bank:{$key}",
                'label' => $label,
                'group' => 'Bank Details',
            ];
        }

        // Document type fields
        $documentTypes = DocumentType::where('is_active', true)->orderBy('sort_order')->get();

        foreach ($documentTypes as $dt) {
            if ($dt->has_value) {
                $sources[] = [
                    'value' => "document_value:{$dt->id}",
                    'label' => "{$dt->name} - Number/Value",
                    'group' => 'Customer Documents',
                ];
            }
            if ($dt->has_expiry) {
                $sources[] = [
                    'value' => "document_issue_date:{$dt->id}",
                    'label' => "{$dt->name} - Issue Date",
                    'group' => 'Customer Documents',
                ];
                $sources[] = [
                    'value' => "document_expiry_date:{$dt->id}",
                    'label' => "{$dt->name} - Expiry Date",
                    'group' => 'Customer Documents',
                ];
            }
        }

        return $sources;
    }

    private function validationRules(): array
    {
        $fieldRules = function (string $prefix) {
            return [
                "{$prefix}.*.name" => 'required|string|max:255',
                "{$prefix}.*.label" => 'required|string|max:255',
                "{$prefix}.*.type" => 'required|string|in:text,textarea,dropdown,file,image,checkbox,date,number',
                "{$prefix}.*.required" => 'required|boolean',
                "{$prefix}.*.placeholder" => 'nullable|string|max:255',
                "{$prefix}.*.options" => 'nullable|array',
                "{$prefix}.*.options.*" => 'required|string|max:255',
                "{$prefix}.*.source" => 'nullable|array',
                "{$prefix}.*.source.type" => 'nullable|string|in:customer,document_value,document_issue_date,document_expiry_date,bank',
                "{$prefix}.*.source.key" => 'nullable|string|max:255',
            ];
        };

        return array_merge([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'form_schema' => 'nullable|array',
            'completion_schema' => 'nullable|array',
            'is_active' => 'boolean',
            'document_type_ids' => 'nullable|array',
            'document_type_ids.*' => 'exists:document_types,id',
            'completion_document_type_ids' => 'nullable|array',
            'completion_document_type_ids.*' => 'exists:document_types,id',
        ], $fieldRules('form_schema'), $fieldRules('completion_schema'));
    }

    private function validationMessages(): array
    {
        return [
            'form_schema.*.label.required' => 'The field label is required.',
            'form_schema.*.options.*.required' => 'Option value cannot be empty.',
            'completion_schema.*.label.required' => 'The field label is required.',
            'completion_schema.*.options.*.required' => 'Option value cannot be empty.',
        ];
    }

    private function validateSchemaFields(array $schema, string $prefix): void
    {
        $names = [];
        foreach ($schema as $index => $field) {
            if (($field['type'] ?? '') === 'dropdown') {
                $options = array_filter($field['options'] ?? [], fn ($o) => trim($o) !== '');
                if (empty($options)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        "{$prefix}.{$index}.options" => 'Dropdown fields must have at least one option.',
                    ]);
                }
            }
            $name = $field['name'] ?? '';
            if ($name !== '' && in_array($name, $names)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    "{$prefix}.{$index}.label" => 'Duplicate field name. Please use a unique label.',
                ]);
            }
            $names[] = $name;
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->validationRules(), $this->validationMessages());

        $this->validateSchemaFields($request->input('form_schema', []), 'form_schema');
        $this->validateSchemaFields($request->input('completion_schema', []), 'completion_schema');

        $validated['form_schema'] = $validated['form_schema'] ?? [];
        $validated['completion_schema'] = $validated['completion_schema'] ?? [];
        $docTypeIds = $validated['document_type_ids'] ?? [];
        $completionDocTypeIds = $validated['completion_document_type_ids'] ?? [];
        unset($validated['document_type_ids'], $validated['completion_document_type_ids']);

        $service = Service::create($validated);

        $syncData = [];
        foreach ($docTypeIds as $id) {
            $syncData[] = ['document_type_id' => $id, 'phase' => 'work'];
        }
        foreach ($completionDocTypeIds as $id) {
            $syncData[] = ['document_type_id' => $id, 'phase' => 'completion'];
        }
        $service->documentTypes()->detach();
        foreach ($syncData as $row) {
            $service->documentTypes()->attach($row['document_type_id'], ['phase' => $row['phase']]);
        }

        return redirect()->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('Admin/Services/Edit', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'form_schema' => $service->form_schema,
                'completion_schema' => $service->completion_schema ?? [],
                'is_active' => $service->is_active,
                'document_type_ids' => $service->workDocumentTypes()->pluck('document_types.id'),
                'completion_document_type_ids' => $service->completionDocumentTypes()->pluck('document_types.id'),
            ],
            'document_types' => DocumentType::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'category']),
            'autofill_sources' => $this->buildAutofillSources(),
        ]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate($this->validationRules(), $this->validationMessages());

        $this->validateSchemaFields($request->input('form_schema', []), 'form_schema');
        $this->validateSchemaFields($request->input('completion_schema', []), 'completion_schema');

        $validated['form_schema'] = $validated['form_schema'] ?? [];
        $validated['completion_schema'] = $validated['completion_schema'] ?? [];
        $docTypeIds = $validated['document_type_ids'] ?? [];
        $completionDocTypeIds = $validated['completion_document_type_ids'] ?? [];
        unset($validated['document_type_ids'], $validated['completion_document_type_ids']);

        $service->update($validated);

        $service->documentTypes()->detach();
        foreach ($docTypeIds as $id) {
            $service->documentTypes()->attach($id, ['phase' => 'work']);
        }
        foreach ($completionDocTypeIds as $id) {
            $service->documentTypes()->attach($id, ['phase' => 'completion']);
        }

        return redirect()->route('admin.services.index')
            ->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    public function submissions(Request $request, Service $service): Response
    {
        $perPage = (int) $request->query('per_page', 15);

        $submissions = $service->submissions()
            ->with('user:id,name,email')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $submissions->through(fn ($sub) => [
            'id' => $sub->id,
            'user_name' => $sub->user?->name ?? 'Deleted User',
            'user_email' => $sub->user?->email ?? '',
            'status' => $sub->status,
            'created_at' => $sub->created_at->format('M d, Y H:i'),
        ]);

        return Inertia::render('Admin/Services/Submissions', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'form_schema' => $service->form_schema,
            ],
            'submissions' => $submissions,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }

    public function showSubmission(Service $service, ServiceSubmission $submission): Response
    {
        if ($submission->service_id !== $service->id) {
            abort(404);
        }

        $submission->load('user:id,name,email');

        return Inertia::render('Admin/Services/ShowSubmission', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'form_schema' => $service->form_schema,
            ],
            'submission' => [
                'id' => $submission->id,
                'user_name' => $submission->user?->name ?? 'Deleted User',
                'user_email' => $submission->user?->email ?? '',
                'form_data' => $submission->form_data,
                'status' => $submission->status,
                'created_at' => $submission->created_at->format('M d, Y H:i'),
            ],
        ]);
    }
}
