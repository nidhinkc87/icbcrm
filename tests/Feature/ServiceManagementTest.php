<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class ServiceManagementTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->createAdmin();
        $this->createEmployee();
    }

    // ── CRUD ──

    public function test_admin_can_view_services_list(): void
    {
        Service::create(['name' => 'VAT Filing', 'form_schema' => [], 'is_active' => true]);

        $response = $this->actingAs($this->admin)->get(route('admin.services.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_service(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'Tax Service',
            'description' => 'Annual tax filing',
            'is_active' => true,
            'form_schema' => [
                ['name' => 'tax_year', 'label' => 'Tax Year', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
            ],
            'completion_schema' => [],
            'document_type_ids' => [],
            'completion_document_type_ids' => [],
        ]);

        $response->assertRedirect(route('admin.services.index'));
        $this->assertDatabaseHas('services', ['name' => 'Tax Service']);
    }

    public function test_service_can_be_created_without_form_schema(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'Simple Service',
            'description' => 'No form needed',
            'is_active' => true,
            'form_schema' => [],
            'completion_schema' => [],
            'document_type_ids' => [],
            'completion_document_type_ids' => [],
        ]);

        $response->assertRedirect(route('admin.services.index'));
        $this->assertDatabaseHas('services', ['name' => 'Simple Service']);
    }

    public function test_admin_can_update_service(): void
    {
        $service = Service::create(['name' => 'Old Name', 'form_schema' => [], 'is_active' => true]);

        $response = $this->actingAs($this->admin)->put(route('admin.services.update', $service), [
            'name' => 'New Name',
            'description' => 'Updated',
            'is_active' => true,
            'form_schema' => [],
            'completion_schema' => [],
            'document_type_ids' => [],
            'completion_document_type_ids' => [],
        ]);

        $response->assertRedirect(route('admin.services.index'));
        $this->assertDatabaseHas('services', ['id' => $service->id, 'name' => 'New Name']);
    }

    public function test_admin_can_delete_service(): void
    {
        $service = Service::create(['name' => 'To Delete', 'form_schema' => [], 'is_active' => true]);

        $response = $this->actingAs($this->admin)->delete(route('admin.services.destroy', $service));

        $response->assertRedirect(route('admin.services.index'));
        $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }

    public function test_employee_cannot_access_service_admin(): void
    {
        $response = $this->actingAs($this->employeeUser)->get(route('admin.services.index'));
        $response->assertForbidden();
    }

    // ── Document Type Mapping ──

    public function test_service_with_work_phase_document_types(): void
    {
        $docType = $this->createDocumentType();

        $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'With Docs',
            'is_active' => true,
            'form_schema' => [],
            'completion_schema' => [],
            'document_type_ids' => [$docType->id],
            'completion_document_type_ids' => [],
        ]);

        $service = Service::where('name', 'With Docs')->first();
        $this->assertCount(1, $service->workDocumentTypes);
        $this->assertCount(0, $service->completionDocumentTypes);
    }

    public function test_service_with_completion_phase_document_types(): void
    {
        $docType = $this->createDocumentType();

        $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'With Comp Docs',
            'is_active' => true,
            'form_schema' => [],
            'completion_schema' => [],
            'document_type_ids' => [],
            'completion_document_type_ids' => [$docType->id],
        ]);

        $service = Service::where('name', 'With Comp Docs')->first();
        $this->assertCount(0, $service->workDocumentTypes);
        $this->assertCount(1, $service->completionDocumentTypes);
    }

    public function test_service_with_both_phase_document_types(): void
    {
        $workDoc = $this->createDocumentType(['name' => 'Work Doc', 'slug' => 'work-doc']);
        $compDoc = $this->createDocumentType(['name' => 'Comp Doc', 'slug' => 'comp-doc']);

        $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'Both Phases',
            'is_active' => true,
            'form_schema' => [],
            'completion_schema' => [],
            'document_type_ids' => [$workDoc->id],
            'completion_document_type_ids' => [$compDoc->id],
        ]);

        $service = Service::where('name', 'Both Phases')->first();
        $this->assertCount(1, $service->workDocumentTypes);
        $this->assertCount(1, $service->completionDocumentTypes);
    }

    // ── Autofill Sources ──

    public function test_create_page_has_autofill_sources(): void
    {
        $this->createDocumentType();

        $response = $this->actingAs($this->admin)->get(route('admin.services.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('autofill_sources'));
    }

    public function test_edit_page_has_autofill_sources(): void
    {
        $service = Service::create(['name' => 'Edit Test', 'form_schema' => [], 'is_active' => true]);
        $this->createDocumentType();

        $response = $this->actingAs($this->admin)->get(route('admin.services.edit', $service));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('autofill_sources'));
    }

    // ── Form Schema with Autofill Source ──

    public function test_service_stores_field_with_source_mapping(): void
    {
        $this->actingAs($this->admin)->post(route('admin.services.store'), [
            'name' => 'Autofill Service',
            'is_active' => true,
            'form_schema' => [
                [
                    'name' => 'license_no',
                    'label' => 'License No',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => '',
                    'options' => [],
                    'source' => ['type' => 'customer', 'key' => 'trade_license_no'],
                ],
            ],
            'completion_schema' => [],
            'document_type_ids' => [],
            'completion_document_type_ids' => [],
        ]);

        $service = Service::where('name', 'Autofill Service')->first();
        $this->assertEquals('customer', $service->form_schema[0]['source']['type']);
        $this->assertEquals('trade_license_no', $service->form_schema[0]['source']['key']);
    }
}
