<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\ServiceSubmission;
use App\Models\Task;
use App\Models\User;
use App\Notifications\Task\TaskCompleted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class TaskCompletionTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupBaseData();
        Storage::fake('public');
        Notification::fake();
    }

    // ── Draft Saving ──

    public function test_save_draft(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.save-draft', $task), [
                'form_data' => ['company_name' => 'Draft Corp'],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('service_submissions', [
            'task_id' => $task->id,
            'status' => 'draft',
        ]);
    }

    public function test_draft_auto_transitions_pending_to_in_progress(): void
    {
        $task = $this->createTask(['status' => 'pending']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.save-draft', $task), [
                'form_data' => ['company_name' => 'Draft'],
            ]);

        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'in_progress']);
    }

    // ── Submission ──

    public function test_submit_completion_with_form_data(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => [
                    'company_name' => 'Test Company',
                    'registration_no' => 'REG-001',
                ],
                'completion_data' => [
                    'certificate_no' => 'CERT-001',
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'completed']);

        $sub = ServiceSubmission::where('task_id', $task->id)->first();
        $this->assertNotNull($sub);
        $this->assertEquals('submitted', $sub->status);
        $this->assertEquals('Test Company', $sub->form_data['form_data']['company_name']);
        $this->assertEquals('CERT-001', $sub->form_data['completion_data']['certificate_no']);
    }

    public function test_completion_sends_notification(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Notif Test'],
                'completion_data' => ['certificate_no' => 'C-1'],
            ]);

        Notification::assertSentTo($this->admin, TaskCompleted::class);
    }

    public function test_cannot_complete_already_completed_task(): void
    {
        $task = $this->createTask(['status' => 'completed']);

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Fail'],
                'completion_data' => ['certificate_no' => 'C-1'],
            ]);

        $response->assertForbidden();
    }

    // ── Document Snapshots ──

    public function test_document_snapshot_saved_on_completion(): void
    {
        $docType = $this->createDocumentType();
        $this->service->documentTypes()->attach($docType->id, ['phase' => 'work']);
        $this->createCustomerDocument($docType);

        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Snap Test'],
                'completion_data' => ['certificate_no' => 'C-1'],
            ]);

        $sub = ServiceSubmission::where('task_id', $task->id)->first();
        $snapshot = $sub->form_data['document_snapshot'] ?? [];
        $this->assertNotEmpty($snapshot);
        $this->assertEquals($docType->id, $snapshot[0]['document_type_id']);
        $this->assertEquals('DOC-12345', $snapshot[0]['value']);
    }

    public function test_work_doc_snapshot_preserves_values_at_submission_time(): void
    {
        $docType = $this->createDocumentType();
        $this->service->documentTypes()->attach($docType->id, ['phase' => 'work']);
        $this->createCustomerDocument($docType, ['value' => 'SNAPSHOT-123']);

        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Snapshot Test'],
                'completion_data' => ['certificate_no' => 'C-1'],
            ]);

        $sub = ServiceSubmission::where('task_id', $task->id)->first();
        $snapshot = $sub->form_data['document_snapshot'] ?? [];
        $workDocs = collect($snapshot)->where('phase', 'work');
        $this->assertNotEmpty($workDocs);
        $this->assertEquals('SNAPSHOT-123', $workDocs->first()['value']);
    }

    public function test_completion_doc_snapshot_empty_when_no_upload(): void
    {
        $docType = $this->createDocumentType(['name' => 'VAT Certificate', 'slug' => 'vat-cert']);
        $this->service->documentTypes()->attach($docType->id, ['phase' => 'completion']);

        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Comp Doc Test'],
                'completion_data' => ['certificate_no' => 'C-1'],
            ]);

        $sub = ServiceSubmission::where('task_id', $task->id)->first();
        $snapshot = $sub->form_data['document_snapshot'] ?? [];
        $compDocs = collect($snapshot)->where('phase', 'completion');
        $this->assertNotEmpty($compDocs);
        // Completion docs should have null values (not auto-filled)
        $this->assertNull($compDocs->first()['value']);
    }

    public function test_update_profile_unchecked_does_not_update_customer(): void
    {
        $docType = $this->createDocumentType();
        $this->service->documentTypes()->attach($docType->id, ['phase' => 'work']);
        $this->createCustomerDocument($docType, ['value' => 'ORIGINAL-123']);

        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'No Update'],
                'completion_data' => ['certificate_no' => 'C-1'],
                'work_doc_updates' => [
                    $docType->id => [
                        'value' => 'CHANGED-456',
                        'issue_date' => '',
                        'expiry_date' => '',
                        'update_profile' => '0',
                    ],
                ],
            ]);

        $doc = CustomerDocument::where('customer_id', $this->customer->id)
            ->where('document_type_id', $docType->id)->first();
        $this->assertEquals('ORIGINAL-123', $doc->value);
    }

    // ── Follow-up Tasks ──

    public function test_followup_task_created_on_completion(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Followup Test'],
                'completion_data' => ['certificate_no' => 'C-1'],
                'followup_due_date' => now()->addMonths(3)->toDateString(),
                'followup_notes' => 'Next quarter filing',
            ]);

        $followUp = Task::where('parent_task_id', $task->id)->first();
        $this->assertNotNull($followUp);
        $this->assertEquals($task->service_id, $followUp->service_id);
        $this->assertEquals($task->customer_id, $followUp->customer_id);
        $this->assertEquals($task->responsible_id, $followUp->responsible_id);
        $this->assertEquals('pending', $followUp->status);
        $this->assertStringContainsString('Next quarter filing', $followUp->instructions);
    }

    public function test_followup_copies_collaborators(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => true]);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Collab Copy'],
                'completion_data' => ['certificate_no' => 'C-1'],
                'followup_due_date' => now()->addMonth()->toDateString(),
            ]);

        $followUp = Task::where('parent_task_id', $task->id)->first();
        $this->assertTrue($followUp->collaborators->contains($collab));
    }

    // ── Show Completed Task ──

    public function test_completed_task_shows_submission_data(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $this->actingAs($this->employeeUser)
            ->post(route('tasks.submit-completion', $task), [
                'form_data' => ['company_name' => 'Show Test'],
                'completion_data' => ['certificate_no' => 'C-SHOW'],
            ]);

        $response = $this->actingAs($this->admin)->get(route('tasks.show', $task));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('submission')
            ->where('submission.status', 'submitted')
        );
    }
}
