<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerDocument;
use App\Models\User;
use App\Notifications\UserInvitation;
use Spatie\Permission\Models\Role;
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
            $roles = $user->getRoleNames();
            $baseRole = $roles->first();
            $additionalRole = $roles->first(fn ($r) => ! in_array($r, ['employee', 'customer', 'admin']));

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $additionalRole ?? $baseRole,
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
        $roles = Role::where('name', '!=', 'admin')->pluck('name');

        if ($type === 'customer') {
            return Inertia::render('Admin/Users/CreateCustomer', ['roles' => $roles]);
        }

        return Inertia::render('Admin/Users/CreateEmployee', ['roles' => $roles]);
    }

    public function store(Request $request): RedirectResponse
    {
        $type = $request->input('type', 'employee');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'type' => 'required|string|in:employee,customer',
            'role' => 'nullable|string|exists:roles,name',
        ];

        if ($type === 'employee') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['personal_email'] = 'nullable|string|email|max:255';
            $rules['contact_number'] = 'nullable|string|max:20';
            $rules['department'] = 'nullable|string|max:255';
            $rules['designation'] = 'nullable|string|max:255';
            $rules['date_of_joining'] = 'nullable|date';
            $rules['emergency_contact_name'] = 'nullable|string|max:255';
            $rules['emergency_contact_number'] = 'nullable|string|max:20';
            $rules['emergency_contact_relationship'] = 'nullable|string|max:255';
            $rules['local_address_line'] = 'nullable|string|max:255';
            $rules['local_city'] = 'nullable|string|max:255';
            $rules['local_emirate'] = 'nullable|string|max:255';
            $rules['local_po_box'] = 'nullable|string|max:50';
            $rules['home_address_line'] = 'nullable|string|max:255';
            $rules['home_city'] = 'nullable|string|max:255';
            $rules['home_state'] = 'nullable|string|max:255';
            $rules['home_country'] = 'nullable|string|max:255';
            $rules['home_postal_code'] = 'nullable|string|max:50';
            $rules['home_contact_number'] = 'nullable|string|max:20';
            $rules['photo'] = 'nullable|file|mimes:jpg,jpeg,png|max:10240';
            $rules['passport'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['emirates_id'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['visa'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['driving_id'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['insurance'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['education_certificates'] = 'nullable|array|max:10';
            $rules['education_certificates.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['offer_letter'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['labour_contract'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['nda'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['handbook'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['personal_goal'] = 'nullable|array|max:5';
            $rules['personal_goal.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['professional_goal'] = 'nullable|array|max:5';
            $rules['professional_goal.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['submission_date'] = 'nullable|date';
        }

        if ($type === 'customer') {
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

        $roles = [$validated['type']];
        if (! empty($validated['role'])) {
            $roles[] = $validated['role'];
        }
        $user->syncRoles(array_unique($roles));

        if ($type === 'employee') {
            $employee = $user->employee()->create([
                'phone' => $validated['phone'] ?? null,
                'personal_email' => $validated['personal_email'] ?? null,
                'contact_number' => $validated['contact_number'] ?? null,
                'department' => $validated['department'] ?? null,
                'designation' => $validated['designation'] ?? null,
                'date_of_joining' => $validated['date_of_joining'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_number' => $validated['emergency_contact_number'] ?? null,
                'emergency_contact_relationship' => $validated['emergency_contact_relationship'] ?? null,
                'local_address' => $validated['local_address'] ?? null,
                'home_country_address' => $validated['home_country_address'] ?? null,
                'submission_date' => $validated['submission_date'] ?? null,
            ]);

            $this->storeEmployeeDocuments($employee, $request);
        }

        if ($type === 'customer') {
            $customer = $user->customer()->create([
                'phone' => $validated['phone'] ?? null,
                'address_line' => $validated['address_line'] ?? null,
                'city' => $validated['city'] ?? null,
                'emirate' => $validated['emirate'] ?? null,
                'country' => $validated['country'] ?? 'UAE',
                'po_box' => $validated['po_box'] ?? null,
            ]);

            $this->storeCustomerDocuments($customer, $request, $validated);
        }

        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitation($token, $validated['type']));

        return redirect()->route('admin.users.index', ['role' => $validated['type']])
            ->with('success', ucfirst($validated['type']) . ' created successfully. Invitation email sent.');
    }

    public function show(User $user): Response
    {
        $role = $user->getRoleNames()->first();

        if ($role === 'customer') {
            $user->load('customer.documents');

            $documents = [];
            if ($user->customer) {
                foreach ($user->customer->documents as $doc) {
                    $documents[] = [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'label' => $doc->label,
                        'original_name' => $doc->original_name,
                        'url' => Storage::disk('public')->url($doc->file_path),
                    ];
                }
            }

            return Inertia::render('Admin/Users/ShowCustomer', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->customer?->phone,
                    'address_line' => $user->customer?->address_line,
                    'city' => $user->customer?->city,
                    'emirate' => $user->customer?->emirate,
                    'country' => $user->customer?->country ?? 'UAE',
                    'po_box' => $user->customer?->po_box,
                    'documents' => $documents,
                    'created_at' => $user->created_at->format('M d, Y'),
                ],
            ]);
        }

        $emp = $user->employee;

        return Inertia::render('Admin/Users/ShowEmployee', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $emp?->phone,
                'personal_email' => $emp?->personal_email,
                'contact_number' => $emp?->contact_number,
                'department' => $emp?->department,
                'designation' => $emp?->designation,
                'date_of_joining' => $emp?->date_of_joining?->format('M d, Y'),
                'emergency_contact_name' => $emp?->emergency_contact_name,
                'emergency_contact_number' => $emp?->emergency_contact_number,
                'emergency_contact_relationship' => $emp?->emergency_contact_relationship,
                'local_address_line' => $emp?->local_address_line,
                'local_city' => $emp?->local_city,
                'local_emirate' => $emp?->local_emirate,
                'local_po_box' => $emp?->local_po_box,
                'home_address_line' => $emp?->home_address_line,
                'home_city' => $emp?->home_city,
                'home_state' => $emp?->home_state,
                'home_country' => $emp?->home_country,
                'home_postal_code' => $emp?->home_postal_code,
                'home_contact_number' => $emp?->home_contact_number,
                'photo' => $emp?->photo ? Storage::disk('public')->url($emp->photo) : null,
                'passport' => $emp?->passport ? Storage::disk('public')->url($emp->passport) : null,
                'emirates_id' => $emp?->emirates_id ? Storage::disk('public')->url($emp->emirates_id) : null,
                'visa' => $emp?->visa ? Storage::disk('public')->url($emp->visa) : null,
                'driving_id' => $emp?->driving_id ? Storage::disk('public')->url($emp->driving_id) : null,
                'insurance' => $emp?->insurance ? Storage::disk('public')->url($emp->insurance) : null,
                'education_certificates' => collect($emp?->education_certificates ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'offer_letter' => $emp?->offer_letter ? Storage::disk('public')->url($emp->offer_letter) : null,
                'labour_contract' => $emp?->labour_contract ? Storage::disk('public')->url($emp->labour_contract) : null,
                'nda' => $emp?->nda ? Storage::disk('public')->url($emp->nda) : null,
                'handbook' => $emp?->handbook ? Storage::disk('public')->url($emp->handbook) : null,
                'personal_goal' => collect($emp?->personal_goal ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'professional_goal' => collect($emp?->professional_goal ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'submission_date' => $emp?->submission_date?->format('M d, Y'),
                'created_at' => $user->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        $role = $user->getRoleNames()->first();
        $allRoles = Role::where('name', '!=', 'admin')->pluck('name');
        $userRoles = $user->getRoleNames()->toArray();

        if ($role === 'customer') {
            $user->load('customer.documents');

            $documents = [];
            if ($user->customer) {
                foreach ($user->customer->documents as $doc) {
                    $documents[] = [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'label' => $doc->label,
                        'original_name' => $doc->original_name,
                        'url' => Storage::disk('public')->url($doc->file_path),
                    ];
                }
            }

            return Inertia::render('Admin/Users/EditCustomer', [
                'allRoles' => $allRoles,
                'userRoles' => $userRoles,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->customer?->phone,
                    'address_line' => $user->customer?->address_line,
                    'city' => $user->customer?->city,
                    'emirate' => $user->customer?->emirate,
                    'country' => $user->customer?->country ?? 'UAE',
                    'po_box' => $user->customer?->po_box,
                    'documents' => $documents,
                ],
            ]);
        }

        $emp = $user->employee;

        return Inertia::render('Admin/Users/EditEmployee', [
            'allRoles' => $allRoles,
            'userRoles' => $userRoles,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $emp?->phone,
                'personal_email' => $emp?->personal_email,
                'contact_number' => $emp?->contact_number,
                'department' => $emp?->department,
                'designation' => $emp?->designation,
                'date_of_joining' => $emp?->date_of_joining?->format('Y-m-d'),
                'emergency_contact_name' => $emp?->emergency_contact_name,
                'emergency_contact_number' => $emp?->emergency_contact_number,
                'emergency_contact_relationship' => $emp?->emergency_contact_relationship,
                'local_address_line' => $emp?->local_address_line,
                'local_city' => $emp?->local_city,
                'local_emirate' => $emp?->local_emirate,
                'local_po_box' => $emp?->local_po_box,
                'home_address_line' => $emp?->home_address_line,
                'home_city' => $emp?->home_city,
                'home_state' => $emp?->home_state,
                'home_country' => $emp?->home_country,
                'home_postal_code' => $emp?->home_postal_code,
                'home_contact_number' => $emp?->home_contact_number,
                'photo_url' => $emp?->photo ? Storage::disk('public')->url($emp->photo) : null,
                'passport_url' => $emp?->passport ? Storage::disk('public')->url($emp->passport) : null,
                'emirates_id_url' => $emp?->emirates_id ? Storage::disk('public')->url($emp->emirates_id) : null,
                'visa_url' => $emp?->visa ? Storage::disk('public')->url($emp->visa) : null,
                'driving_id_url' => $emp?->driving_id ? Storage::disk('public')->url($emp->driving_id) : null,
                'insurance_url' => $emp?->insurance ? Storage::disk('public')->url($emp->insurance) : null,
                'education_certificates_urls' => collect($emp?->education_certificates ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'offer_letter_url' => $emp?->offer_letter ? Storage::disk('public')->url($emp->offer_letter) : null,
                'labour_contract_url' => $emp?->labour_contract ? Storage::disk('public')->url($emp->labour_contract) : null,
                'nda_url' => $emp?->nda ? Storage::disk('public')->url($emp->nda) : null,
                'handbook_url' => $emp?->handbook ? Storage::disk('public')->url($emp->handbook) : null,
                'personal_goal_urls' => collect($emp?->personal_goal ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'professional_goal_urls' => collect($emp?->professional_goal ?? [])->map(fn ($p) => Storage::disk('public')->url($p)),
                'submission_date' => $emp?->submission_date?->format('Y-m-d'),
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
            'role' => 'nullable|string|exists:roles,name',
        ];

        if ($role === 'employee') {
            $rules['phone'] = 'nullable|string|max:20';
            $rules['personal_email'] = 'nullable|string|email|max:255';
            $rules['contact_number'] = 'nullable|string|max:20';
            $rules['department'] = 'nullable|string|max:255';
            $rules['designation'] = 'nullable|string|max:255';
            $rules['date_of_joining'] = 'nullable|date';
            $rules['emergency_contact_name'] = 'nullable|string|max:255';
            $rules['emergency_contact_number'] = 'nullable|string|max:20';
            $rules['emergency_contact_relationship'] = 'nullable|string|max:255';
            $rules['local_address_line'] = 'nullable|string|max:255';
            $rules['local_city'] = 'nullable|string|max:255';
            $rules['local_emirate'] = 'nullable|string|max:255';
            $rules['local_po_box'] = 'nullable|string|max:50';
            $rules['home_address_line'] = 'nullable|string|max:255';
            $rules['home_city'] = 'nullable|string|max:255';
            $rules['home_state'] = 'nullable|string|max:255';
            $rules['home_country'] = 'nullable|string|max:255';
            $rules['home_postal_code'] = 'nullable|string|max:50';
            $rules['home_contact_number'] = 'nullable|string|max:20';
            $rules['photo'] = 'nullable|file|mimes:jpg,jpeg,png|max:10240';
            $rules['passport'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['emirates_id'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['visa'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['driving_id'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['insurance'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['education_certificates'] = 'nullable|array|max:10';
            $rules['education_certificates.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['offer_letter'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['labour_contract'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['nda'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['handbook'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['personal_goal'] = 'nullable|array|max:5';
            $rules['personal_goal.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['professional_goal'] = 'nullable|array|max:5';
            $rules['professional_goal.*'] = 'file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['submission_date'] = 'nullable|date';
        }

        if ($role === 'customer') {
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
            $rules['remove_documents.*'] = 'integer|exists:customer_documents,id';
        }

        $validated = $request->validate($rules);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            ...(! empty($validated['password'])
                ? ['password' => $validated['password']]
                : []),
        ]);

        // Sync roles — always keep the base role (employee/customer))
        $newRoles = [$role];
        if (! empty($validated['role'])) {
            $newRoles[] = $validated['role'];
        }
        $user->syncRoles(array_unique($newRoles));

        if ($role === 'employee') {
            $employee = $user->employee()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $validated['phone'] ?? null,
                    'personal_email' => $validated['personal_email'] ?? null,
                    'contact_number' => $validated['contact_number'] ?? null,
                    'department' => $validated['department'] ?? null,
                    'designation' => $validated['designation'] ?? null,
                    'date_of_joining' => $validated['date_of_joining'] ?? null,
                    'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                    'emergency_contact_number' => $validated['emergency_contact_number'] ?? null,
                    'emergency_contact_relationship' => $validated['emergency_contact_relationship'] ?? null,
                    'local_address_line' => $validated['local_address_line'] ?? null,
                    'local_city' => $validated['local_city'] ?? null,
                    'local_emirate' => $validated['local_emirate'] ?? null,
                    'local_po_box' => $validated['local_po_box'] ?? null,
                    'home_address_line' => $validated['home_address_line'] ?? null,
                    'home_city' => $validated['home_city'] ?? null,
                    'home_state' => $validated['home_state'] ?? null,
                    'home_country' => $validated['home_country'] ?? null,
                    'home_postal_code' => $validated['home_postal_code'] ?? null,
                    'home_contact_number' => $validated['home_contact_number'] ?? null,
                    'submission_date' => $validated['submission_date'] ?? null,
                ]
            );

            $this->storeEmployeeDocuments($employee, $request);
        }

        if ($role === 'customer') {
            $customer = $user->customer()->updateOrCreate(
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
                $docsToRemove = $customer->documents()->whereIn('id', $validated['remove_documents'])->get();
                foreach ($docsToRemove as $doc) {
                    Storage::disk('public')->delete($doc->file_path);
                    $doc->delete();
                }
            }

            // Replace KYC documents if new files uploaded
            foreach (['emirates_id', 'passport', 'trade_license', 'moa'] as $docType) {
                if ($request->hasFile($docType)) {
                    $existing = $customer->documents()->where('type', $docType)->first();
                    if ($existing) {
                        Storage::disk('public')->delete($existing->file_path);
                        $existing->delete();
                    }

                    $file = $request->file($docType);
                    $path = $file->store("customer-documents/{$customer->id}", 'public');

                    $customer->documents()->create([
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
                        $path = $file->store("customer-documents/{$customer->id}", 'public');
                        $customer->documents()->create([
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

        // Clean up customer documents from storage
        if ($user->customer) {
            foreach ($user->customer->documents as $doc) {
                Storage::disk('public')->delete($doc->file_path);
            }
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    private function storeEmployeeDocuments($employee, Request $request): void
    {
        $storagePath = "employee-documents/{$employee->id}";

        // Single-file fields
        $singleFields = ['photo', 'passport', 'emirates_id', 'visa', 'driving_id', 'insurance', 'offer_letter', 'labour_contract', 'nda', 'handbook'];
        foreach ($singleFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old file if exists
                if ($employee->$field) {
                    Storage::disk('public')->delete($employee->$field);
                }
                $employee->$field = $request->file($field)->store($storagePath, 'public');
            }
        }

        // Multi-file fields (replace all on upload)
        $multiFields = ['education_certificates', 'personal_goal', 'professional_goal'];
        foreach ($multiFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old files
                foreach ($employee->$field ?? [] as $oldPath) {
                    Storage::disk('public')->delete($oldPath);
                }
                $paths = [];
                foreach ($request->file($field) as $file) {
                    $paths[] = $file->store($storagePath, 'public');
                }
                $employee->$field = $paths;
            }
        }

        $employee->save();
    }

    private function storeCustomerDocuments($customer, Request $request, array $validated): void
    {
        foreach (['emirates_id', 'passport', 'trade_license', 'moa'] as $docType) {
            if ($request->hasFile($docType)) {
                $file = $request->file($docType);
                $path = $file->store("customer-documents/{$customer->id}", 'public');

                $customer->documents()->create([
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
                    $path = $file->store("customer-documents/{$customer->id}", 'public');
                    $customer->documents()->create([
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
