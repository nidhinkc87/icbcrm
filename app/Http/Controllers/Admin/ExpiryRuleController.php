<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Models\ExpiryActionRule;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpiryRuleController extends Controller
{
    public function index()
    {
        $rules = ExpiryActionRule::with(['documentType', 'service', 'assignedEmployee'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/ExpiryRules/Index', [
            'rules' => $rules,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ExpiryRules/Create', [
            'document_types' => DocumentType::where('is_active', true)->get(['id', 'name']),
            'services' => Service::where('is_active', true)->get(['id', 'name']),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type_id' => 'required|exists:document_types,id',
            'trigger_days_before' => 'required|integer|min:0|max:365',
            'action' => 'required|in:notify_only,auto_create_task',
            'service_id' => 'nullable|required_if:action,auto_create_task|exists:services,id',
            'assignment_strategy' => 'required|in:last_employee,admin,specific_employee',
            'assigned_employee_id' => 'nullable|required_if:assignment_strategy,specific_employee|exists:users,id',
            'notify_customer' => 'boolean',
            'notify_admin' => 'boolean',
            'priority' => 'required|in:low,medium,high,urgent',
            'is_active' => 'boolean',
        ]);

        ExpiryActionRule::create($validated);

        return redirect()->route('admin.expiry-rules.index')->with('success', 'Expiry rule created successfully.');
    }

    public function edit(ExpiryActionRule $expiry_rule)
    {
        $expiry_rule->load(['documentType', 'service', 'assignedEmployee']);

        return Inertia::render('Admin/ExpiryRules/Edit', [
            'rule' => $expiry_rule,
            'document_types' => DocumentType::where('is_active', true)->get(['id', 'name']),
            'services' => Service::where('is_active', true)->get(['id', 'name']),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, ExpiryActionRule $expiry_rule)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type_id' => 'required|exists:document_types,id',
            'trigger_days_before' => 'required|integer|min:0|max:365',
            'action' => 'required|in:notify_only,auto_create_task',
            'service_id' => 'nullable|required_if:action,auto_create_task|exists:services,id',
            'assignment_strategy' => 'required|in:last_employee,admin,specific_employee',
            'assigned_employee_id' => 'nullable|required_if:assignment_strategy,specific_employee|exists:users,id',
            'notify_customer' => 'boolean',
            'notify_admin' => 'boolean',
            'priority' => 'required|in:low,medium,high,urgent',
            'is_active' => 'boolean',
        ]);

        $expiry_rule->update($validated);

        return redirect()->route('admin.expiry-rules.index')->with('success', 'Expiry rule updated successfully.');
    }

    public function destroy(ExpiryActionRule $expiry_rule)
    {
        $expiry_rule->delete();

        return redirect()->route('admin.expiry-rules.index')->with('success', 'Expiry rule deleted successfully.');
    }
}
