<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class AutofillTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupBaseData();
        Notification::fake();
    }

    public function test_autofill_customer_profile_field(): void
    {
        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'license',
                    'label' => 'License',
                    'type' => 'text',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'customer', 'key' => 'trade_license_no'],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'pending']);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('autofill_data.license', 'TL-12345')
        );
    }

    public function test_autofill_document_value(): void
    {
        $docType = $this->createDocumentType();
        $this->createCustomerDocument($docType, ['value' => 'TL-99999']);

        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'trade_no',
                    'label' => 'Trade License No',
                    'type' => 'text',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'document_value', 'key' => (string) $docType->id],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'pending']);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('autofill_data.trade_no', 'TL-99999')
        );
    }

    public function test_autofill_document_expiry_date(): void
    {
        $docType = $this->createDocumentType();
        $expiryDate = now()->addYear()->toDateString();
        $this->createCustomerDocument($docType, ['expiry_date' => $expiryDate]);

        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'license_expiry',
                    'label' => 'License Expiry',
                    'type' => 'date',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'document_expiry_date', 'key' => (string) $docType->id],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'pending']);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('autofill_data.license_expiry', $expiryDate)
        );
    }

    public function test_autofill_bank_detail(): void
    {
        $this->createBankDetail(['iban' => 'AE999888777666']);

        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'iban_number',
                    'label' => 'IBAN',
                    'type' => 'text',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'bank', 'key' => 'iban'],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'pending']);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('autofill_data.iban_number', 'AE999888777666')
        );
    }

    public function test_autofill_not_applied_when_draft_exists(): void
    {
        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'license',
                    'label' => 'License',
                    'type' => 'text',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'customer', 'key' => 'trade_license_no'],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'in_progress']);

        // Save a draft first
        $this->actingAs($this->employeeUser)
            ->post(route('tasks.save-draft', $task), [
                'form_data' => ['license' => 'DRAFT-VALUE'],
            ]);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        // Autofill data is still passed, but frontend prioritizes draft
        $response->assertInertia(fn ($page) => $page
            ->has('autofill_data')
            ->has('draft_data')
        );
    }

    public function test_field_without_source_has_no_autofill(): void
    {
        $this->service->update([
            'form_schema' => [
                [
                    'name' => 'manual_field',
                    'label' => 'Manual Entry',
                    'type' => 'text',
                    'required' => false,
                    'placeholder' => '',
                    'options' => [],
                ],
            ],
        ]);

        $task = $this->createTask(['status' => 'pending']);

        $response = $this->actingAs($this->employeeUser)
            ->get(route('tasks.complete', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('autofill_data', [])
        );
    }
}
