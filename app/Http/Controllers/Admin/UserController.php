<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
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
            // Company details
            $rules['legal_type'] = 'required|string|max:255';
            $rules['trade_license_no'] = 'required|string|max:255';
            $rules['issuing_authority'] = 'required|string|max:255';
            $rules['trade_license_file'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['moa_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['trade_license_issue_date'] = 'required|date';
            $rules['trade_license_expiry_date'] = 'required|date|after:trade_license_issue_date';
            $rules['moa_issue_date'] = 'nullable|date';

            // Partners (repeatable)
            $rules['partners'] = 'required|array|min:1';
            $rules['partners.*.name'] = 'required|string|max:255';
            $rules['partners.*.emirates_id_no'] = 'required|string|max:255';
            $rules['partners.*.emirates_id_file'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['partners.*.passport_no'] = 'required|string|max:255';
            $rules['partners.*.passport_file'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['partners.*.emirates_id_expiry'] = 'required|date';
            $rules['partners.*.passport_expiry'] = 'required|date';

            // Bank details
            $rules['bank_name'] = 'nullable|string|max:255';
            $rules['bank_branch'] = 'nullable|string|max:255';
            $rules['account_number'] = 'nullable|string|max:255';
            $rules['iban'] = 'nullable|string|max:255';

            // Address
            $rules['address_line'] = 'required|string|max:255';
            $rules['emirate'] = 'required|string|max:255';
            $rules['city'] = 'required|string|max:255';
            $rules['po_box'] = 'nullable|string|max:50';

            // Contact
            $rules['contact_person_name'] = 'nullable|string|max:255';
            $rules['phone'] = 'required|string|max:20';
            $rules['telephone'] = 'nullable|string|max:20';

            // Branches (optional, repeatable)
            $rules['branches'] = 'nullable|array';
            $rules['branches.*.name'] = 'required|string|max:255';
            $rules['branches.*.trade_license_no'] = 'required|string|max:255';
            $rules['branches.*.issuing_authority'] = 'required|string|max:255';
            $rules['branches.*.moa_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['branches.*.issue_date'] = 'required|date';
            $rules['branches.*.expiry_date'] = 'required|date|after:branches.*.issue_date';
        }

        $validated = $request->validate($rules);

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
            ]);

            $this->storeEmployeeDocuments($employee, $request);
        }

        if ($type === 'customer') {
            $customer = $user->customer()->create([
                'phone' => $validated['phone'],
                'address_line' => $validated['address_line'],
                'city' => $validated['city'],
                'emirate' => $validated['emirate'],
                'country' => 'UAE',
                'po_box' => $validated['po_box'] ?? null,
                'legal_type' => $validated['legal_type'],
                'trade_license_no' => $validated['trade_license_no'],
                'issuing_authority' => $validated['issuing_authority'],
                'contact_person_name' => $validated['contact_person_name'],
                'telephone' => $validated['telephone'] ?? null,
            ]);

            $this->storeCustomerOnboarding($customer, $request, $validated);
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
            $user->load(['customer.documents.documentType', 'customer.partners', 'customer.branches', 'customer.bankDetail']);

            return Inertia::render('Admin/Users/ShowCustomer', [
                'user' => $this->buildCustomerData($user),
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
            $user->load(['customer.documents.documentType', 'customer.partners', 'customer.branches', 'customer.bankDetail']);

            return Inertia::render('Admin/Users/EditCustomer', [
                'allRoles' => $allRoles,
                'userRoles' => $userRoles,
                'user' => $this->buildCustomerData($user),
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
            // Company details
            $rules['legal_type'] = 'required|string|max:255';
            $rules['trade_license_no'] = 'required|string|max:255';
            $rules['issuing_authority'] = 'required|string|max:255';
            $rules['trade_license_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['moa_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['trade_license_issue_date'] = 'required|date';
            $rules['trade_license_expiry_date'] = 'required|date|after:trade_license_issue_date';
            $rules['moa_issue_date'] = 'nullable|date';

            // Partners
            $rules['partners'] = 'required|array|min:1';
            $rules['partners.*.id'] = 'nullable|integer';
            $rules['partners.*.name'] = 'required|string|max:255';
            $rules['partners.*.emirates_id_no'] = 'required|string|max:255';
            $rules['partners.*.emirates_id_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['partners.*.passport_no'] = 'required|string|max:255';
            $rules['partners.*.passport_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['partners.*.emirates_id_expiry'] = 'required|date';
            $rules['partners.*.passport_expiry'] = 'required|date';

            // Bank
            $rules['bank_name'] = 'nullable|string|max:255';
            $rules['bank_branch'] = 'nullable|string|max:255';
            $rules['account_number'] = 'nullable|string|max:255';
            $rules['iban'] = 'nullable|string|max:255';

            // Address
            $rules['address_line'] = 'required|string|max:255';
            $rules['emirate'] = 'required|string|max:255';
            $rules['city'] = 'required|string|max:255';
            $rules['po_box'] = 'nullable|string|max:50';

            // Contact
            $rules['contact_person_name'] = 'nullable|string|max:255';
            $rules['phone'] = 'required|string|max:20';
            $rules['telephone'] = 'nullable|string|max:20';

            // Branches
            $rules['branches'] = 'nullable|array';
            $rules['branches.*.id'] = 'nullable|integer';
            $rules['branches.*.name'] = 'required|string|max:255';
            $rules['branches.*.trade_license_no'] = 'required|string|max:255';
            $rules['branches.*.issuing_authority'] = 'required|string|max:255';
            $rules['branches.*.moa_file'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240';
            $rules['branches.*.issue_date'] = 'required|date';
            $rules['branches.*.expiry_date'] = 'required|date|after:branches.*.issue_date';

            // Removals
            $rules['remove_partner_ids'] = 'nullable|array';
            $rules['remove_branch_ids'] = 'nullable|array';
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
                    'phone' => $validated['phone'],
                    'address_line' => $validated['address_line'],
                    'city' => $validated['city'],
                    'emirate' => $validated['emirate'],
                    'country' => 'UAE',
                    'po_box' => $validated['po_box'] ?? null,
                    'legal_type' => $validated['legal_type'],
                    'trade_license_no' => $validated['trade_license_no'],
                    'issuing_authority' => $validated['issuing_authority'],
                    'contact_person_name' => $validated['contact_person_name'],
                    'telephone' => $validated['telephone'] ?? null,
                ]
            );

            $this->updateCustomerOnboarding($customer, $request, $validated);
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

    private function buildCustomerData(User $user): array
    {
        $c = $user->customer;
        $docs = $c?->documents ?? collect();

        $docUrl = fn ($slug, $partnerId = null, $branchId = null) => $docs
            ->where('documentType.slug', $slug)
            ->when($partnerId, fn ($q) => $q->where('partner_id', $partnerId))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereNull($partnerId ? null : 'partner_id')
            ->whereNull($branchId ? null : 'branch_id')
            ->first();

        $fileUrl = fn ($doc) => $doc?->file_path ? Storage::disk('public')->url($doc->file_path) : null;

        $tlDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'trade_license' && ! $d->partner_id && ! $d->branch_id)->first();
        $moaDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'moa' && ! $d->partner_id && ! $d->branch_id)->first();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $c?->phone,
            'address_line' => $c?->address_line,
            'city' => $c?->city,
            'emirate' => $c?->emirate,
            'country' => $c?->country ?? 'UAE',
            'po_box' => $c?->po_box,
            'legal_type' => $c?->legal_type,
            'trade_license_no' => $c?->trade_license_no,
            'issuing_authority' => $c?->issuing_authority,
            'contact_person_name' => $c?->contact_person_name,
            'telephone' => $c?->telephone,
            'trade_license_file_url' => $fileUrl($tlDoc),
            'moa_file_url' => $fileUrl($moaDoc),
            'trade_license_issue_date' => $tlDoc?->issue_date?->format('Y-m-d'),
            'trade_license_expiry_date' => $tlDoc?->expiry_date?->format('Y-m-d'),
            'moa_issue_date' => $moaDoc?->issue_date?->format('Y-m-d'),
            'partners' => ($c?->partners ?? collect())->map(function ($partner) use ($docs, $fileUrl) {
                $eidDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'partner_emirates_id' && $d->partner_id === $partner->id)->first();
                $passDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'partner_passport' && $d->partner_id === $partner->id)->first();

                return [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'emirates_id_no' => $eidDoc?->value,
                    'emirates_id_file_url' => $fileUrl($eidDoc),
                    'emirates_id_expiry' => $eidDoc?->expiry_date?->format('Y-m-d'),
                    'passport_no' => $passDoc?->value,
                    'passport_file_url' => $fileUrl($passDoc),
                    'passport_expiry' => $passDoc?->expiry_date?->format('Y-m-d'),
                ];
            })->values(),
            'bank_name' => $c?->bankDetail?->bank_name,
            'bank_branch' => $c?->bankDetail?->branch,
            'account_number' => $c?->bankDetail?->account_number,
            'iban' => $c?->bankDetail?->iban,
            'branches' => ($c?->branches ?? collect())->map(function ($branch) use ($docs, $fileUrl) {
                $tlDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'branch_trade_license' && $d->branch_id === $branch->id)->first();
                $authDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'branch_issuing_authority' && $d->branch_id === $branch->id)->first();
                $moaDoc = $docs->filter(fn ($d) => $d->documentType?->slug === 'branch_moa' && $d->branch_id === $branch->id)->first();

                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'trade_license_no' => $tlDoc?->value,
                    'issuing_authority' => $authDoc?->value,
                    'moa_file_url' => $fileUrl($moaDoc),
                    'issue_date' => $tlDoc?->issue_date?->format('Y-m-d'),
                    'expiry_date' => $tlDoc?->expiry_date?->format('Y-m-d'),
                ];
            })->values(),
            'created_at' => $user->created_at->format('M d, Y'),
        ];
    }

    private function updateCustomerOnboarding($customer, Request $request, array $validated): void
    {
        $storagePath = "customer-documents/{$customer->id}";
        $docTypes = DocumentType::pluck('id', 'slug');

        // Update company documents (Trade License)
        $this->upsertCompanyDocument($customer, $docTypes['trade_license'], $request, 'trade_license_file', [
            'value' => $validated['trade_license_no'],
            'issue_date' => $validated['trade_license_issue_date'],
            'expiry_date' => $validated['trade_license_expiry_date'],
        ], $storagePath);

        // Update MOA
        $this->upsertCompanyDocument($customer, $docTypes['moa'], $request, 'moa_file', [
            'issue_date' => $validated['moa_issue_date'] ?? null,
            'expiry_date' => null,
        ], $storagePath);

        // Remove deleted partners
        if (! empty($validated['remove_partner_ids'])) {
            $customer->partners()->whereIn('id', $validated['remove_partner_ids'])->each(function ($partner) use ($customer) {
                $customer->documents()->where('partner_id', $partner->id)->each(function ($doc) {
                    if ($doc->file_path) {
                        Storage::disk('public')->delete($doc->file_path);
                    }
                    $doc->delete();
                });
                $partner->delete();
            });
        }

        // Upsert partners
        foreach ($validated['partners'] as $index => $partnerData) {
            $partner = ! empty($partnerData['id'])
                ? $customer->partners()->find($partnerData['id'])
                : null;

            if ($partner) {
                $partner->update(['name' => $partnerData['name']]);
            } else {
                $partner = $customer->partners()->create(['name' => $partnerData['name']]);
            }

            // Emirates ID
            $this->upsertPartnerDocument($customer, $partner, $docTypes['partner_emirates_id'], $request, "partners.{$index}.emirates_id_file", [
                'value' => $partnerData['emirates_id_no'],
                'expiry_date' => $partnerData['emirates_id_expiry'],
            ], $storagePath);

            // Passport
            $this->upsertPartnerDocument($customer, $partner, $docTypes['partner_passport'], $request, "partners.{$index}.passport_file", [
                'value' => $partnerData['passport_no'],
                'expiry_date' => $partnerData['passport_expiry'],
            ], $storagePath);
        }

        // Update bank details
        $customer->bankDetail()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'bank_name' => $validated['bank_name'],
                'branch' => $validated['bank_branch'] ?? null,
                'account_number' => $validated['account_number'] ?? null,
                'iban' => $validated['iban'],
            ]
        );

        // Remove deleted branches
        if (! empty($validated['remove_branch_ids'])) {
            $customer->branches()->whereIn('id', $validated['remove_branch_ids'])->each(function ($branch) use ($customer) {
                $customer->documents()->where('branch_id', $branch->id)->each(function ($doc) {
                    if ($doc->file_path) {
                        Storage::disk('public')->delete($doc->file_path);
                    }
                    $doc->delete();
                });
                $branch->delete();
            });
        }

        // Upsert branches
        foreach ($validated['branches'] ?? [] as $index => $branchData) {
            $branch = ! empty($branchData['id'])
                ? $customer->branches()->find($branchData['id'])
                : null;

            if ($branch) {
                $branch->update(['name' => $branchData['name']]);
            } else {
                $branch = $customer->branches()->create(['name' => $branchData['name']]);
            }

            // Branch Trade License
            $existing = $customer->documents()->where('branch_id', $branch->id)->where('document_type_id', $docTypes['branch_trade_license'])->first();
            if ($existing) {
                $existing->update(['value' => $branchData['trade_license_no'], 'issue_date' => $branchData['issue_date'], 'expiry_date' => $branchData['expiry_date']]);
            } else {
                $customer->documents()->create(['document_type_id' => $docTypes['branch_trade_license'], 'branch_id' => $branch->id, 'value' => $branchData['trade_license_no'], 'issue_date' => $branchData['issue_date'], 'expiry_date' => $branchData['expiry_date']]);
            }

            // Branch Issuing Authority
            $existing = $customer->documents()->where('branch_id', $branch->id)->where('document_type_id', $docTypes['branch_issuing_authority'])->first();
            if ($existing) {
                $existing->update(['value' => $branchData['issuing_authority']]);
            } else {
                $customer->documents()->create(['document_type_id' => $docTypes['branch_issuing_authority'], 'branch_id' => $branch->id, 'value' => $branchData['issuing_authority']]);
            }

            // Branch MOA file
            if ($request->hasFile("branches.{$index}.moa_file")) {
                $existingMoa = $customer->documents()->where('branch_id', $branch->id)->where('document_type_id', $docTypes['branch_moa'])->first();
                if ($existingMoa?->file_path) {
                    Storage::disk('public')->delete($existingMoa->file_path);
                    $existingMoa->delete();
                }
                $file = $request->file("branches.{$index}.moa_file");
                $customer->documents()->create(['document_type_id' => $docTypes['branch_moa'], 'branch_id' => $branch->id, 'file_path' => $file->store($storagePath, 'public'), 'original_name' => $file->getClientOriginalName(), 'issue_date' => $branchData['issue_date'], 'expiry_date' => $branchData['expiry_date']]);
            }
        }
    }

    private function upsertCompanyDocument($customer, int $docTypeId, Request $request, string $fileField, array $data, string $storagePath): void
    {
        $existing = $customer->documents()->where('document_type_id', $docTypeId)->whereNull('partner_id')->whereNull('branch_id')->first();

        if ($existing) {
            $existing->update($data);
            if ($request->hasFile($fileField)) {
                if ($existing->file_path) {
                    Storage::disk('public')->delete($existing->file_path);
                }
                $file = $request->file($fileField);
                $existing->update(['file_path' => $file->store($storagePath, 'public'), 'original_name' => $file->getClientOriginalName()]);
            }
        } elseif ($request->hasFile($fileField)) {
            $file = $request->file($fileField);
            $customer->documents()->create(array_merge($data, [
                'document_type_id' => $docTypeId,
                'file_path' => $file->store($storagePath, 'public'),
                'original_name' => $file->getClientOriginalName(),
            ]));
        }
    }

    private function upsertPartnerDocument($customer, $partner, int $docTypeId, Request $request, string $fileField, array $data, string $storagePath): void
    {
        $existing = $customer->documents()->where('document_type_id', $docTypeId)->where('partner_id', $partner->id)->first();

        if ($existing) {
            $existing->update($data);
            if ($request->hasFile($fileField)) {
                if ($existing->file_path) {
                    Storage::disk('public')->delete($existing->file_path);
                }
                $file = $request->file($fileField);
                $existing->update(['file_path' => $file->store($storagePath, 'public'), 'original_name' => $file->getClientOriginalName()]);
            }
        } elseif ($request->hasFile($fileField)) {
            $file = $request->file($fileField);
            $customer->documents()->create(array_merge($data, [
                'document_type_id' => $docTypeId,
                'partner_id' => $partner->id,
                'file_path' => $file->store($storagePath, 'public'),
                'original_name' => $file->getClientOriginalName(),
            ]));
        }
    }

    private function storeCustomerOnboarding($customer, Request $request, array $validated): void
    {
        $storagePath = "customer-documents/{$customer->id}";
        $docTypes = DocumentType::pluck('id', 'slug');

        // Company-level documents: Trade License
        if ($request->hasFile('trade_license_file')) {
            $file = $request->file('trade_license_file');
            $customer->documents()->create([
                'document_type_id' => $docTypes['trade_license'],
                'value' => $validated['trade_license_no'],
                'file_path' => $file->store($storagePath, 'public'),
                'original_name' => $file->getClientOriginalName(),
                'issue_date' => $validated['trade_license_issue_date'],
                'expiry_date' => $validated['trade_license_expiry_date'],
            ]);
        }

        // Company-level documents: MOA
        if ($request->hasFile('moa_file')) {
            $file = $request->file('moa_file');
            $customer->documents()->create([
                'document_type_id' => $docTypes['moa'],
                'file_path' => $file->store($storagePath, 'public'),
                'original_name' => $file->getClientOriginalName(),
                'issue_date' => $validated['moa_issue_date'] ?? null,
            ]);
        }

        // Partners
        foreach ($validated['partners'] as $index => $partnerData) {
            $partner = $customer->partners()->create([
                'name' => $partnerData['name'],
            ]);

            // Emirates ID
            if ($request->hasFile("partners.{$index}.emirates_id_file")) {
                $file = $request->file("partners.{$index}.emirates_id_file");
                $customer->documents()->create([
                    'document_type_id' => $docTypes['partner_emirates_id'],
                    'partner_id' => $partner->id,
                    'value' => $partnerData['emirates_id_no'],
                    'file_path' => $file->store($storagePath, 'public'),
                    'original_name' => $file->getClientOriginalName(),
                    'expiry_date' => $partnerData['emirates_id_expiry'],
                ]);
            }

            // Passport
            if ($request->hasFile("partners.{$index}.passport_file")) {
                $file = $request->file("partners.{$index}.passport_file");
                $customer->documents()->create([
                    'document_type_id' => $docTypes['partner_passport'],
                    'partner_id' => $partner->id,
                    'value' => $partnerData['passport_no'],
                    'file_path' => $file->store($storagePath, 'public'),
                    'original_name' => $file->getClientOriginalName(),
                    'expiry_date' => $partnerData['passport_expiry'],
                ]);
            }
        }

        // Bank details
        $customer->bankDetail()->create([
            'bank_name' => $validated['bank_name'],
            'branch' => $validated['bank_branch'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'iban' => $validated['iban'],
        ]);

        // Branches (optional)
        if (! empty($validated['branches'])) {
            foreach ($validated['branches'] as $index => $branchData) {
                $branch = $customer->branches()->create([
                    'name' => $branchData['name'],
                ]);

                // Branch Trade License (value stored as document)
                $customer->documents()->create([
                    'document_type_id' => $docTypes['branch_trade_license'],
                    'branch_id' => $branch->id,
                    'value' => $branchData['trade_license_no'],
                    'issue_date' => $branchData['issue_date'],
                    'expiry_date' => $branchData['expiry_date'],
                ]);

                // Branch Issuing Authority
                $customer->documents()->create([
                    'document_type_id' => $docTypes['branch_issuing_authority'],
                    'branch_id' => $branch->id,
                    'value' => $branchData['issuing_authority'],
                ]);

                // Branch MOA file (optional)
                if ($request->hasFile("branches.{$index}.moa_file")) {
                    $file = $request->file("branches.{$index}.moa_file");
                    $customer->documents()->create([
                        'document_type_id' => $docTypes['branch_moa'],
                        'branch_id' => $branch->id,
                        'file_path' => $file->store($storagePath, 'public'),
                        'original_name' => $file->getClientOriginalName(),
                        'issue_date' => $branchData['issue_date'],
                        'expiry_date' => $branchData['expiry_date'],
                    ]);
                }
            }
        }
    }
}
