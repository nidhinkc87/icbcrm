<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use App\Models\ExpiryActionRule;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ExpiryActionRuleSeeder extends Seeder
{
    public function run(): void
    {
        $docTypes = DocumentType::pluck('id', 'slug');
        $services = Service::pluck('id', 'name');

        $rules = [
            // Trade License — auto-create renewal task 30 days before
            [
                'name' => 'Trade License Renewal (30 days)',
                'slug' => 'trade_license',
                'trigger_days_before' => 30,
                'action' => 'auto_create_task',
                'service_name' => 'Trade License Renewal',
                'priority' => 'high',
            ],
            // Trade License — urgent notification 7 days before
            [
                'name' => 'Trade License Expiry Urgent (7 days)',
                'slug' => 'trade_license',
                'trigger_days_before' => 7,
                'action' => 'notify_only',
                'service_name' => null,
                'priority' => 'urgent',
            ],
            // MOA — notify 30 days before
            [
                'name' => 'MOA Expiry Notice (30 days)',
                'slug' => 'moa',
                'trigger_days_before' => 30,
                'action' => 'notify_only',
                'service_name' => null,
                'priority' => 'medium',
            ],
            // Emirates ID — auto-create PRO task 30 days before
            [
                'name' => 'Emirates ID Renewal (30 days)',
                'slug' => 'partner_emirates_id',
                'trigger_days_before' => 30,
                'action' => 'auto_create_task',
                'service_name' => 'PRO Services',
                'priority' => 'high',
            ],
            // Passport — auto-create PRO task 60 days before
            [
                'name' => 'Passport Renewal (60 days)',
                'slug' => 'partner_passport',
                'trigger_days_before' => 60,
                'action' => 'auto_create_task',
                'service_name' => 'PRO Services',
                'priority' => 'medium',
            ],
            // Branch Trade License — auto-create renewal 30 days before
            [
                'name' => 'Branch License Renewal (30 days)',
                'slug' => 'branch_trade_license',
                'trigger_days_before' => 30,
                'action' => 'auto_create_task',
                'service_name' => 'Trade License Renewal',
                'priority' => 'high',
            ],
        ];

        foreach ($rules as $rule) {
            $docTypeId = $docTypes[$rule['slug']] ?? null;
            if (! $docTypeId) {
                continue;
            }

            ExpiryActionRule::updateOrCreate(
                [
                    'document_type_id' => $docTypeId,
                    'trigger_days_before' => $rule['trigger_days_before'],
                ],
                [
                    'name' => $rule['name'],
                    'action' => $rule['action'],
                    'service_ids' => $rule['service_name'] ? [($services[$rule['service_name']] ?? null)] : null,
                    'assignment_strategy' => 'last_employee',
                    'notify_customer' => true,
                    'notify_admin' => true,
                    'priority' => $rule['priority'],
                    'is_active' => true,
                ]
            );
        }
    }
}
