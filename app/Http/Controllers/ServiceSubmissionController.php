<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceSubmissionController extends Controller
{
    public function index(): Response
    {
        $services = Service::where('is_active', true)
            ->select('id', 'name', 'description')
            ->orderBy('name')
            ->get();

        return Inertia::render('Services/Index', [
            'services' => $services,
        ]);
    }

    public function create(Service $service): Response
    {
        if (! $service->is_active) {
            abort(404);
        }

        return Inertia::render('Services/Submit', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'form_schema' => $service->form_schema,
            ],
        ]);
    }

    public function store(Request $request, Service $service): RedirectResponse
    {
        if (! $service->is_active) {
            abort(404);
        }

        $rules = [];
        $formSchema = $service->form_schema;

        foreach ($formSchema as $field) {
            $fieldRules = $field['required'] ? ['required'] : ['nullable'];

            match ($field['type']) {
                'text' => $fieldRules[] = 'string|max:255',
                'textarea' => $fieldRules[] = 'string|max:5000',
                'dropdown' => $fieldRules[] = 'string|in:' . implode(',', $field['options'] ?? []),
                'number' => $fieldRules[] = 'numeric',
                'date' => $fieldRules[] = 'date',
                'checkbox' => $fieldRules[] = 'boolean',
                'file' => $fieldRules[] = 'file|max:10240',
                'image' => $fieldRules[] = 'image|max:5120',
                default => null,
            };

            $rules['fields.' . $field['name']] = $fieldRules;
        }

        $request->validate($rules);

        $formData = [];
        foreach ($formSchema as $field) {
            $key = $field['name'];
            if (in_array($field['type'], ['file', 'image']) && $request->hasFile("fields.{$key}")) {
                $formData[$key] = $request->file("fields.{$key}")->store('service-uploads', 'public');
            } else {
                $formData[$key] = $request->input("fields.{$key}");
            }
        }

        ServiceSubmission::create([
            'service_id' => $service->id,
            'user_id' => auth()->id(),
            'form_data' => $formData,
            'status' => 'pending',
        ]);

        return redirect()->route('services.index')
            ->with('success', 'Form submitted successfully.');
    }

    public function mySubmissions(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 15);

        $submissions = ServiceSubmission::where('user_id', auth()->id())
            ->with('service:id,name')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $submissions->through(fn ($sub) => [
            'id' => $sub->id,
            'service_name' => $sub->service->name,
            'status' => $sub->status,
            'created_at' => $sub->created_at->format('M d, Y H:i'),
        ]);

        return Inertia::render('Services/MySubmissions', [
            'submissions' => $submissions,
        ]);
    }
}
