<?php

namespace Tests\Unit;

use App\Models\DocumentType;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_form_schema_cast_to_array(): void
    {
        $service = Service::create([
            'name' => 'Test',
            'form_schema' => [['name' => 'field1', 'type' => 'text']],
            'is_active' => true,
        ]);

        $service->refresh();
        $this->assertIsArray($service->form_schema);
        $this->assertEquals('field1', $service->form_schema[0]['name']);
    }

    public function test_completion_schema_cast_to_array(): void
    {
        $service = Service::create([
            'name' => 'Test',
            'form_schema' => [],
            'completion_schema' => [['name' => 'cert', 'type' => 'text']],
            'is_active' => true,
        ]);

        $service->refresh();
        $this->assertIsArray($service->completion_schema);
    }

    public function test_work_document_types_relationship(): void
    {
        $service = Service::create(['name' => 'Test', 'form_schema' => [], 'is_active' => true]);
        $docType = DocumentType::create([
            'name' => 'License', 'slug' => 'license', 'category' => 'company',
            'has_expiry' => true, 'has_file' => true, 'has_value' => true,
            'is_active' => true, 'sort_order' => 1,
        ]);

        $service->documentTypes()->attach($docType->id, ['phase' => 'work']);

        $this->assertCount(1, $service->workDocumentTypes);
        $this->assertCount(0, $service->completionDocumentTypes);
    }

    public function test_completion_document_types_relationship(): void
    {
        $service = Service::create(['name' => 'Test', 'form_schema' => [], 'is_active' => true]);
        $docType = DocumentType::create([
            'name' => 'Cert', 'slug' => 'cert', 'category' => 'company',
            'has_expiry' => false, 'has_file' => true, 'has_value' => true,
            'is_active' => true, 'sort_order' => 1,
        ]);

        $service->documentTypes()->attach($docType->id, ['phase' => 'completion']);

        $this->assertCount(0, $service->workDocumentTypes);
        $this->assertCount(1, $service->completionDocumentTypes);
    }

    public function test_same_doc_type_can_be_in_both_phases(): void
    {
        $service = Service::create(['name' => 'Test', 'form_schema' => [], 'is_active' => true]);
        $docType = DocumentType::create([
            'name' => 'MOA', 'slug' => 'moa', 'category' => 'company',
            'has_expiry' => true, 'has_file' => true, 'has_value' => false,
            'is_active' => true, 'sort_order' => 1,
        ]);

        $service->documentTypes()->attach($docType->id, ['phase' => 'work']);
        $service->documentTypes()->attach($docType->id, ['phase' => 'completion']);

        $this->assertCount(1, $service->workDocumentTypes);
        $this->assertCount(1, $service->completionDocumentTypes);
        $this->assertCount(2, $service->documentTypes);
    }
}
