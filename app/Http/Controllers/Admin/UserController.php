<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClientDocument;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $role = $request->query('role');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'created_at');
        $sortDirection = $request->query('direction', 'desc');
        $perPage = (int) $request->query('per_page', 15);

        $allowedSorts = ['name', 'email', 'created_at'];
        if (! in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        if (! in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $users = User::when($role, function ($query, $role) {
            $query->role($role);
        })->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        })->with('roles')
          ->orderBy($sortField, $sortDirection)
          ->paginate($perPage)
          ->withQueryString();

        $users->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'created_at' => $user->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'role' => $role,
                'search' => $search,
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $type = $request->query('type', 'employee');

        if ($type === 'client') {
            return Inertia::render('Admin/Users/CreateClient');
        }

        return Inertia::render('Admin/Users/CreateEmployee');
    }

    public function store(Request $request): RedirectResponse
    {
        $type = $request->input('type', 'employee');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'type' => 'required|string|in:employee,client',
        ];

        if ($type === 'employee') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['department'] = 'nullable|string|max:255';
            $rules['designation'] = 'nullable|string|max:255';
            $rules['date_of_joining'] = 'nullable|date';
        }

        if ($type === 'client') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['address_line'] = 'nullable|string|max:255';
            $rules['city'] = 'nullable|string|max:255';
            $rules['emirate'] = 'nullable|string|max:255';
            $rules['country'] = 'nullable|string|max:255';
            $rules['po_box'] = 'nullable|string|max:50';
            $rules['emirates_id'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['passport'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['trade_license'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['moa'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['additional_documents'] = 'nullable|array';
            $rules['additional_documents.*.label'] = 'required|string|max:255';
            $rules['additional_documents.*.file'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
        }

        $validated = $request->validate($rules, [
            'emirates_id.required' => 'Emirates ID document is required.',
            'passport.required' => 'Passport document is required.',
            'trade_license.required' => 'Trade License document is required.',
            'moa.required' => 'MOA document is required.',
            'additional_documents.*.label.required' => 'Document label is required.',
            'additional_documents.*.file.required' => 'Document file is required.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Str::random(32),
            'must_set_password' => true,
        ]);

        $user->assignRole($validated['type']);

        if ($type === 'employee') {
            $user->employee()->create([
                'phone' => $validated['phone'] ?? null,
                'department' => $validated['department'] ?? null,
                'designation' => $validated['designation'] ?? null,
                'date_of_joining' => $validated['date_of_joining'] ?? null,
            ]);
        }

        if ($type === 'client') {
            $client = $user->client()->create([
                'phone' => $validated['phone'] ?? null,
                'address_line' => $validated['address_line'] ?? null,
                'city' => $validated['city'] ?? null,
                'emirate' => $validated['emirate'] ?? null,
                'country' => $validated['country'] ?? 'UAE',
                'po_box' => $validated['po_box'] ?? null,
            ]);

            $this->storeClientDocuments($client, $request, $validated);
        }

        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitation($token, $validated['type']));

        return redirect()->route('admin.users.index', ['role' => $validated['type']])
            ->with('success', ucfirst($validated['type']) . ' created successfully. Invitation email sent.');
    }

    public function show(User $user): Response
    {
        $role = $user->getRoleNames()->first();

        if ($role === 'client') {
            $user->load('client.documents');

            $documents = [];
            if ($user->client) {
                foreach ($user->client->documents as $doc) {
                    $documents[] = [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'label' => $doc->label,
                        'original_name' => $doc->original_name,
                        'url' => Storage::disk('public')->url($doc->file_path),
                    ];
                }
            }

            return Inertia::render('Admin/Users/ShowClient', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->client?->phone,
                    'address_line' => $user->client?->address_line,
                    'city' => $user->client?->city,
                    'emirate' => $user->client?->emirate,
                    'country' => $user->client?->country ?? 'UAE',
                    'po_box' => $user->client?->po_box,
                    'documents' => $documents,
                    'created_at' => $user->created_at->format('M d, Y'),
                ],
            ]);
        }

        return Inertia::render('Admin/Users/ShowEmployee', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->employee?->phone,
                'department' => $user->employee?->department,
                'designation' => $user->employee?->designation,
                'date_of_joining' => $user->employee?->date_of_joining?->format('M d, Y'),
                'created_at' => $user->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        $role = $user->getRoleNames()->first();

        if ($role === 'client') {
            $user->load('client.documents');

            $documents = [];
            if ($user->client) {
                foreach ($user->client->documents as $doc) {
                    $documents[] = [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'label' => $doc->label,
                        'original_name' => $doc->original_name,
                        'url' => Storage::disk('public')->url($doc->file_path),
                    ];
                }
            }

            return Inertia::render('Admin/Users/EditClient', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->client?->phone,
                    'address_line' => $user->client?->address_line,
                    'city' => $user->client?->city,
                    'emirate' => $user->client?->emirate,
                    'country' => $user->client?->country ?? 'UAE',
                    'po_box' => $user->client?->po_box,
                    'documents' => $documents,
                ],
            ]);
        }

        return Inertia::render('Admin/Users/EditEmployee', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->employee?->phone,
                'department' => $user->employee?->department,
                'designation' => $user->employee?->designation,
                'date_of_joining' => $user->employee?->date_of_joining?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $role = $user->getRoleNames()->first();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ];

        if ($role === 'employee') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['department'] = 'nullable|string|max:255';
            $rules['designation'] = 'nullable|string|max:255';
            $rules['date_of_joining'] = 'nullable|date';
        }

        if ($role === 'client') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['address_line'] = 'nullable|string|max:255';
            $rules['city'] = 'nullable|string|max:255';
            $rules['emirate'] = 'nullable|string|max:255';
            $rules['country'] = 'nullable|string|max:255';
            $rules['po_box'] = 'nullable|string|max:50';
            $rules['emirates_id'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['passport'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['trade_license'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['moa'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['additional_documents'] = 'nullable|array';
            $rules['additional_documents.*.label'] = 'required|string|max:255';
            $rules['additional_documents.*.file'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['remove_documents'] = 'nullable|array';
            $rules['remove_documents.*'] = 'integer|exists:client_documents,id';
        }

        $validated = $request->validate($rules);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            ...(! empty($validated['password'])
                ? ['password' => $validated['password']]
                : []),
        ]);

        if ($role === 'employee') {
            $user->employee()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $validated['phone'] ?? null,
                    'department' => $validated['department'] ?? null,
                    'designation' => $validated['designation'] ?? null,
                    'date_of_joining' => $validated['date_of_joining'] ?? null,
                ]
            );
        }

        if ($role === 'client') {
            $client = $user->client()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $validated['phone'] ?? null,
                    'address_line' => $validated['address_line'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'emirate' => $validated['emirate'] ?? null,
                    'country' => $validated['country'] ?? 'UAE',
                    'po_box' => $validated['po_box'] ?? null,
                ]
            );

            // Remove documents marked for deletion
            if (! empty($validated['remove_documents'])) {
                $docsToRemove = $client->documents()->whereIn('id', $validated['remove_documents'])->get();
                foreach ($docsToRemove as $doc) {
                    Storage::disk('public')->delete($doc->file_path);
                    $doc->delete();
                }
            }

            // Replace KYC documents if new files uploaded
            foreach (['emirates_id', 'passport', 'trade_license', 'moa'] as $docType) {
                if ($request->hasFile($docType)) {
                    $existing = $client->documents()->where('type', $docType)->first();
                    if ($existing) {
                        Storage::disk('public')->delete($existing->file_path);
                        $existing->delete();
                    }

                    $file = $request->file($docType);
                    $path = $file->store("client-documents/{$client->id}", 'public');

                    $client->documents()->create([
                        'type' => $docType,
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                    ]);
                }
            }

            // Add new additional documents
            if (! empty($validated['additional_documents'])) {
                foreach ($validated['additional_documents'] as $index => $additionalDoc) {
                    $file = $request->file("additional_documents.{$index}.file");
                    if ($file) {
                        $path = $file->store("client-documents/{$client->id}", 'public');
                        $client->documents()->create([
                            'type' => 'additional',
                            'label' => $additionalDoc['label'],
                            'file_path' => $path,
                            'original_name' => $file->getClientOriginalName(),
                        ]);
                    }
                }
            }
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        // Clean up client documents from storage
        if ($user->client) {
            foreach ($user->client->documents as $doc) {
                Storage::disk('public')->delete($doc->file_path);
            }
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    private function storeClientDocuments($client, Request $request, array $validated): void
    {
        foreach (['emirates_id', 'passport', 'trade_license', 'moa'] as $docType) {
            if ($request->hasFile($docType)) {
                $file = $request->file($docType);
                $path = $file->store("client-documents/{$client->id}", 'public');

                $client->documents()->create([
                    'type' => $docType,
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        if (! empty($validated['additional_documents'])) {
            foreach ($validated['additional_documents'] as $index => $additionalDoc) {
                $file = $request->file("additional_documents.{$index}.file");
                if ($file) {
                    $path = $file->store("client-documents/{$client->id}", 'public');
                    $client->documents()->create([
                        'type' => 'additional',
                        'label' => $additionalDoc['label'],
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                    ]);
                }
            }
        }
    }
}
