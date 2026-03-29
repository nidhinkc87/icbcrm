<?php

namespace Tests\Traits;

use App\Models\Customer;
use App\Models\CustomerBankDetail;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\Service;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

trait CreatesTestData
{
    protected User $admin;
    protected User $employeeUser;
    protected User $customerUser;
    protected Customer $customer;
    protected Service $service;

    protected function seedRolesAndPermissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function createAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $this->admin = $user;
    }

    protected function createEmployee(): User
    {
        $user = User::factory()->create();
        $user->assignRole('employee');
        Employee::create(['user_id' => $user->id]);

        return $this->employeeUser = $user;
    }

    protected function createCustomerUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $this->customer = Customer::create([
            'user_id' => $user->id,
            'phone' => '0501234567',
            'trade_license_no' => 'TL-12345',
            'issuing_authority' => 'DED',
            'legal_type' => 'LLC',
            'city' => 'Dubai',
            'emirate' => 'Dubai',
            'country' => 'UAE',
            'contact_person_name' => 'John Doe',
        ]);

        return $this->customerUser = $user;
    }

    protected function createService(array $overrides = []): Service
    {
        return $this->service = Service::create(array_merge([
            'name' => 'Test Service',
            'description' => 'A test service',
            'form_schema' => [
                ['name' => 'company_name', 'label' => 'Company Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                ['name' => 'registration_no', 'label' => 'Registration No', 'type' => 'text', 'required' => false, 'placeholder' => '', 'options' => []],
            ],
            'completion_schema' => [
                ['name' => 'certificate_no', 'label' => 'Certificate No', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
            ],
            'is_active' => true,
        ], $overrides));
    }

    protected function createTask(array $overrides = []): Task
    {
        if (! isset($this->service)) {
            $this->createService();
        }

        return Task::create(array_merge([
            'created_by' => $this->admin->id,
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => now()->addDays(7),
            'instructions' => 'Test instructions',
        ], $overrides));
    }

    protected function createDocumentType(array $overrides = []): DocumentType
    {
        return DocumentType::create(array_merge([
            'name' => 'Trade License',
            'slug' => 'trade-license',
            'category' => 'company',
            'has_expiry' => true,
            'has_file' => true,
            'has_value' => true,
            'is_required' => true,
            'is_active' => true,
            'sort_order' => 1,
        ], $overrides));
    }

    protected function createCustomerDocument(DocumentType $docType, array $overrides = []): CustomerDocument
    {
        return CustomerDocument::create(array_merge([
            'customer_id' => $this->customer->id,
            'document_type_id' => $docType->id,
            'value' => 'DOC-12345',
            'issue_date' => now()->subYear(),
            'expiry_date' => now()->addYear(),
        ], $overrides));
    }

    protected function createBankDetail(array $overrides = []): CustomerBankDetail
    {
        return CustomerBankDetail::create(array_merge([
            'customer_id' => $this->customer->id,
            'bank_name' => 'Emirates NBD',
            'branch' => 'Dubai Main',
            'account_number' => '1234567890',
            'iban' => 'AE123456789012345678',
        ], $overrides));
    }

    protected function setupBaseData(): void
    {
        $this->seedRolesAndPermissions();
        $this->createAdmin();
        $this->createEmployee();
        $this->createCustomerUser();
        $this->createService();
    }
}
