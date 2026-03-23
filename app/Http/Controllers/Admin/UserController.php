<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
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

        $validated = $request->validate($rules);

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

        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitation($token, $validated['type']));

        return redirect()->route('admin.users.index', ['role' => $validated['type']])
            ->with('success', ucfirst($validated['type']) . ' created successfully. Invitation email sent.');
    }

    public function edit(User $user): Response
    {
        $role = $user->getRoleNames()->first();

        if ($role === 'client') {
            return Inertia::render('Admin/Users/EditClient', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
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

        $validated = $request->validate($rules);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            ...(! empty($validated['password'])
                ? ['password' => Hash::make($validated['password'])]
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

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
