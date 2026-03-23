<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
        return Inertia::render('Admin/Services/Create');
    }

    private function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'form_schema' => 'required|array|min:1',
            'form_schema.*.name' => 'required|string|max:255',
            'form_schema.*.label' => 'required|string|max:255',
            'form_schema.*.type' => 'required|string|in:text,textarea,dropdown,file,image,checkbox,date,number',
            'form_schema.*.required' => 'required|boolean',
            'form_schema.*.placeholder' => 'nullable|string|max:255',
            'form_schema.*.options' => 'nullable|array',
            'form_schema.*.options.*' => 'required|string|max:255',
            'is_active' => 'boolean',
        ];
    }

    private function validationMessages(): array
    {
        return [
            'form_schema.*.label.required' => 'The field label is required.',
            'form_schema.*.options.*.required' => 'Option value cannot be empty.',
        ];
    }

    private function validateFormSchema(Request $request): void
    {
        $schema = $request->input('form_schema', []);
        $names = [];

        foreach ($schema as $index => $field) {
            // Dropdown must have at least one option
            if (($field['type'] ?? '') === 'dropdown') {
                $options = array_filter($field['options'] ?? [], fn ($o) => trim($o) !== '');
                if (empty($options)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        "form_schema.{$index}.options" => 'Dropdown fields must have at least one option.',
                    ]);
                }
            }

            // Check for duplicate field names
            $name = $field['name'] ?? '';
            if ($name !== '' && in_array($name, $names)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    "form_schema.{$index}.label" => 'Duplicate field name. Please use a unique label.',
                ]);
            }
            $names[] = $name;
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->validationRules(), $this->validationMessages());

        $this->validateFormSchema($request);

        Service::create($validated);

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
                'is_active' => $service->is_active,
            ],
        ]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate($this->validationRules(), $this->validationMessages());

        $this->validateFormSchema($request);

        $service->update($validated);

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
