<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Service;
use App\Models\ServiceSubmission;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Services with form schemas
        $vatFiling = Service::create([
            'name' => 'VAT Filing',
            'description' => 'Quarterly VAT return filing for UAE businesses',
            'form_schema' => [
                ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter TRN number', 'options' => []],
                ['name' => 'filing_period', 'label' => 'Filing Period', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select period', 'options' => ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']],
                ['name' => 'total_sales', 'label' => 'Total Sales (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'total_purchases', 'label' => 'Total Purchases (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'vat_payable', 'label' => 'VAT Payable (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'filing_date', 'label' => 'Filing Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Any additional notes', 'options' => []],
            ],
            'completion_schema' => [
                ['name' => 'filing_receipt', 'label' => 'Filing Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'confirmation_number', 'label' => 'Confirmation Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter FTA confirmation number', 'options' => []],
                ['name' => 'filing_completed_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
            ],
            'is_active' => true,
        ]);

        $tradeLicense = Service::create([
            'name' => 'Trade License Renewal',
            'description' => 'Annual trade license renewal service',
            'form_schema' => [
                ['name' => 'license_number', 'label' => 'License Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter license number', 'options' => []],
                ['name' => 'license_type', 'label' => 'License Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select type', 'options' => ['Commercial', 'Professional', 'Industrial', 'Tourism']],
                ['name' => 'expiry_date', 'label' => 'Current Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'renewal_date', 'label' => 'Renewal Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'activity_description', 'label' => 'Activity Description', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Describe business activities', 'options' => []],
                ['name' => 'documents_verified', 'label' => 'Documents Verified', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'All required documents have been verified', 'options' => []],
            ],
            'completion_schema' => [
                ['name' => 'renewed_license', 'label' => 'Renewed License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'new_expiry_date', 'label' => 'New Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
            ],
            'is_active' => true,
        ]);

        $companyFormation = Service::create([
            'name' => 'Company Formation',
            'description' => 'New company registration and formation',
            'form_schema' => [
                ['name' => 'company_name', 'label' => 'Proposed Company Name', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter company name', 'options' => []],
                ['name' => 'legal_form', 'label' => 'Legal Form', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select legal form', 'options' => ['LLC', 'Sole Proprietorship', 'Free Zone Company', 'Branch Office']],
                ['name' => 'share_capital', 'label' => 'Share Capital (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'number_of_shareholders', 'label' => 'Number of Shareholders', 'type' => 'number', 'required' => true, 'placeholder' => '1', 'options' => []],
                ['name' => 'registered_address', 'label' => 'Registered Address', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Full address', 'options' => []],
                ['name' => 'incorporation_date', 'label' => 'Desired Incorporation Date', 'type' => 'date', 'required' => false, 'placeholder' => '', 'options' => []],
            ],
            'completion_schema' => [
                ['name' => 'trade_license', 'label' => 'Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'moa_copy', 'label' => 'Memorandum of Association', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'registration_number', 'label' => 'Registration Number', 'type' => 'text', 'required' => true, 'placeholder' => 'DED/Freezone registration number', 'options' => []],
            ],
            'is_active' => true,
        ]);

        $auditService = Service::create([
            'name' => 'Annual Audit',
            'description' => 'Comprehensive annual financial audit',
            'form_schema' => [
                ['name' => 'fiscal_year', 'label' => 'Fiscal Year', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select year', 'options' => ['2024', '2025', '2026']],
                ['name' => 'total_revenue', 'label' => 'Total Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'total_expenses', 'label' => 'Total Expenses (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                ['name' => 'audit_opinion', 'label' => 'Audit Opinion', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select opinion', 'options' => ['Unqualified', 'Qualified', 'Adverse', 'Disclaimer']],
                ['name' => 'findings', 'label' => 'Key Findings', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Summary of key audit findings', 'options' => []],
            ],
            'completion_schema' => [
                ['name' => 'audit_report', 'label' => 'Audit Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'management_letter', 'label' => 'Management Letter', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
            ],
            'is_active' => true,
        ]);

        $services = [$vatFiling, $tradeLicense, $companyFormation, $auditService];

        // Create Employees
        $employees = [];
        $employeeData = [
            ['name' => 'Sarah Ahmed', 'email' => 'sarah@icbcrm.com', 'department' => 'Tax', 'designation' => 'Senior Tax Consultant'],
            ['name' => 'Mohammed Ali', 'email' => 'mohammed@icbcrm.com', 'department' => 'Audit', 'designation' => 'Audit Manager'],
            ['name' => 'Fatima Hassan', 'email' => 'fatima@icbcrm.com', 'department' => 'Corporate', 'designation' => 'Corporate Specialist'],
        ];

        foreach ($employeeData as $empData) {
            $user = User::create([
                'name' => $empData['name'],
                'email' => $empData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('employee');
            Employee::create([
                'user_id' => $user->id,
                'phone' => '+971 5' . rand(0, 9) . ' ' . rand(100, 999) . ' ' . rand(1000, 9999),
                'department' => $empData['department'],
                'designation' => $empData['designation'],
                'date_of_joining' => Carbon::now()->subMonths(rand(6, 24)),
            ]);
            $employees[] = $user;
        }

        // Include the test employee
        $testEmployee = User::where('email', 'employee@icbcrm.com')->first();
        if ($testEmployee) {
            $employees[] = $testEmployee;
        }

        // Create Clients
        $customers = [];
        $customerData = [
            ['name' => 'Al Maktoum Trading LLC', 'email' => 'almaktoum@example.com', 'city' => 'Dubai', 'emirate' => 'Dubai'],
            ['name' => 'Gulf Star Enterprises', 'email' => 'gulfstar@example.com', 'city' => 'Abu Dhabi', 'emirate' => 'Abu Dhabi'],
            ['name' => 'Emirates Tech Solutions', 'email' => 'emiratestech@example.com', 'city' => 'Sharjah', 'emirate' => 'Sharjah'],
            ['name' => 'Falcon Logistics Co', 'email' => 'falcon@example.com', 'city' => 'Dubai', 'emirate' => 'Dubai'],
            ['name' => 'Oasis Hospitality Group', 'email' => 'oasis@example.com', 'city' => 'Ras Al Khaimah', 'emirate' => 'Ras Al Khaimah'],
        ];

        foreach ($customerData as $cd) {
            $user = User::create([
                'name' => $cd['name'],
                'email' => $cd['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('customer');
            $customer = Customer::create([
                'user_id' => $user->id,
                'phone' => '+971 4 ' . rand(100, 999) . ' ' . rand(1000, 9999),
                'city' => $cd['city'],
                'emirate' => $cd['emirate'],
                'country' => 'UAE',
            ]);
            $customers[] = $customer;
        }

        // Create Tasks with varied statuses, priorities, and dates
        $admin = User::where('email', 'admin@icbcrm.com')->first();
        $priorities = ['low', 'medium', 'high', 'urgent'];
        $statuses = ['pending', 'in_progress', 'completed'];

        $taskConfigs = [
            // Completed tasks (oldest)
            ['service' => 0, 'customer' => 0, 'employee' => 0, 'status' => 'completed', 'priority' => 'high', 'days_ago' => 20, 'due_days_ago' => 15],
            ['service' => 1, 'customer' => 1, 'employee' => 1, 'status' => 'completed', 'priority' => 'medium', 'days_ago' => 18, 'due_days_ago' => 10],
            ['service' => 0, 'customer' => 2, 'employee' => 0, 'status' => 'completed', 'priority' => 'low', 'days_ago' => 15, 'due_days_ago' => 8],
            ['service' => 3, 'customer' => 3, 'employee' => 1, 'status' => 'completed', 'priority' => 'urgent', 'days_ago' => 12, 'due_days_ago' => 5],
            ['service' => 2, 'customer' => 4, 'employee' => 2, 'status' => 'completed', 'priority' => 'medium', 'days_ago' => 10, 'due_days_ago' => 3],
            ['service' => 0, 'customer' => 0, 'employee' => 2, 'status' => 'completed', 'priority' => 'high', 'days_ago' => 8, 'due_days_ago' => 1],
            // In progress tasks
            ['service' => 1, 'customer' => 0, 'employee' => 0, 'status' => 'in_progress', 'priority' => 'high', 'days_ago' => 5, 'due_days' => 3],
            ['service' => 0, 'customer' => 1, 'employee' => 1, 'status' => 'in_progress', 'priority' => 'urgent', 'days_ago' => 4, 'due_days' => 5],
            ['service' => 3, 'customer' => 2, 'employee' => 2, 'status' => 'in_progress', 'priority' => 'medium', 'days_ago' => 3, 'due_days' => 7],
            ['service' => 2, 'customer' => 3, 'employee' => 0, 'status' => 'in_progress', 'priority' => 'low', 'days_ago' => 2, 'due_days' => 10],
            // Overdue in-progress
            ['service' => 0, 'customer' => 4, 'employee' => 1, 'status' => 'in_progress', 'priority' => 'high', 'days_ago' => 10, 'due_days_ago' => 2],
            ['service' => 1, 'customer' => 2, 'employee' => 2, 'status' => 'in_progress', 'priority' => 'urgent', 'days_ago' => 8, 'due_days_ago' => 1],
            // Pending tasks
            ['service' => 0, 'customer' => 0, 'employee' => 0, 'status' => 'pending', 'priority' => 'medium', 'days_ago' => 1, 'due_days' => 14],
            ['service' => 2, 'customer' => 1, 'employee' => 1, 'status' => 'pending', 'priority' => 'high', 'days_ago' => 1, 'due_days' => 7],
            ['service' => 3, 'customer' => 4, 'employee' => 2, 'status' => 'pending', 'priority' => 'low', 'days_ago' => 0, 'due_days' => 21],
            ['service' => 1, 'customer' => 3, 'employee' => 0, 'status' => 'pending', 'priority' => 'urgent', 'days_ago' => 0, 'due_days' => 2],
            // Assigned to test employee
            ['service' => 0, 'customer' => 0, 'employee' => 3, 'status' => 'pending', 'priority' => 'high', 'days_ago' => 0, 'due_days' => 5],
            ['service' => 1, 'customer' => 1, 'employee' => 3, 'status' => 'in_progress', 'priority' => 'medium', 'days_ago' => 3, 'due_days' => 4],
        ];

        $instructions = [
            'Please complete the filing by the due date. All supporting documents are attached.',
            'Client has requested priority handling. Coordinate with the finance team.',
            'Ensure all compliance requirements are met before submission.',
            'Review previous period data and reconcile any discrepancies.',
            null,
        ];

        foreach ($taskConfigs as $tc) {
            $dueDate = isset($tc['due_days'])
                ? Carbon::now()->addDays($tc['due_days'])
                : Carbon::now()->subDays($tc['due_days_ago']);

            $task = Task::create([
                'created_by' => $admin->id,
                'service_id' => $services[$tc['service']]->id,
                'customer_id' => $customers[$tc['customer']]->id,
                'responsible_id' => $employees[$tc['employee']]->id,
                'priority' => $tc['priority'],
                'status' => $tc['status'],
                'due_date' => $dueDate,
                'instructions' => $instructions[array_rand($instructions)],
                'created_at' => Carbon::now()->subDays($tc['days_ago']),
                'updated_at' => $tc['status'] === 'completed'
                    ? Carbon::now()->subDays(max(0, $tc['days_ago'] - 3))
                    : Carbon::now()->subDays($tc['days_ago']),
            ]);

            // Add collaborators to some tasks
            if (rand(0, 1)) {
                $collaboratorIds = collect($employees)
                    ->where('id', '!=', $employees[$tc['employee']]->id)
                    ->random(min(2, count($employees) - 1))
                    ->pluck('id');
                $task->collaborators()->sync($collaboratorIds);
            }

            // Create submissions for completed tasks
            if ($tc['status'] === 'completed') {
                $formSchema = $services[$tc['service']]->form_schema;
                $formData = [];
                foreach ($formSchema as $field) {
                    switch ($field['type']) {
                        case 'text':
                            $formData[$field['name']] = 'Sample ' . $field['label'] . ' data';
                            break;
                        case 'number':
                            $formData[$field['name']] = rand(1000, 500000);
                            break;
                        case 'date':
                            $formData[$field['name']] = Carbon::now()->subDays(rand(1, 30))->format('Y-m-d');
                            break;
                        case 'dropdown':
                            $formData[$field['name']] = $field['options'][array_rand($field['options'])];
                            break;
                        case 'checkbox':
                            $formData[$field['name']] = true;
                            break;
                        case 'textarea':
                            $formData[$field['name']] = 'Completed as per requirements. All documents verified and filed.';
                            break;
                    }
                }

                ServiceSubmission::create([
                    'service_id' => $services[$tc['service']]->id,
                    'user_id' => $employees[$tc['employee']]->id,
                    'task_id' => $task->id,
                    'form_data' => $formData,
                    'status' => 'submitted',
                ]);
            }
        }

        // Add comments to some tasks
        $commentTexts = [
            'I have started working on this. Will update once the documents are reviewed.',
            'Client has provided all the required documents.',
            'Need clarification on the filing period. Will follow up with the client.',
            'All calculations verified. Ready for final submission.',
            'Please review the attached documents before proceeding.',
            'Updated the figures as per the latest financial statements.',
            'Completed the initial review. Moving to final checks.',
            'Client requested a meeting to discuss the progress.',
        ];

        $tasks = Task::all();
        foreach ($tasks->random(min(12, $tasks->count())) as $task) {
            $numComments = rand(1, 3);
            for ($i = 0; $i < $numComments; $i++) {
                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $employees[array_rand($employees)]->id,
                    'body' => $commentTexts[array_rand($commentTexts)],
                    'created_at' => Carbon::now()->subHours(rand(1, 200)),
                ]);
            }
        }
    }
}
