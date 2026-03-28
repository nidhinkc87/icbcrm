<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            // =====================================================================
            // COMPANY-LEVEL DOCUMENTS
            // =====================================================================
            [
                'name' => 'Trade License',
                'slug' => 'trade_license',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Memorandum of Association',
                'slug' => 'moa',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => false,
                'is_required' => true,
                'sort_order' => 20,
            ],

            // =====================================================================
            // PARTNER/MANAGER-LEVEL DOCUMENTS
            // =====================================================================
            [
                'name' => 'Emirates ID',
                'slug' => 'partner_emirates_id',
                'category' => 'partner',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => true,
                'sort_order' => 30,
            ],
            [
                'name' => 'Passport',
                'slug' => 'partner_passport',
                'category' => 'partner',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => true,
                'sort_order' => 40,
            ],

            // =====================================================================
            // BRANCH-LEVEL DOCUMENTS
            // =====================================================================
            [
                'name' => 'Branch Trade License',
                'slug' => 'branch_trade_license',
                'category' => 'branch',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => true,
                'sort_order' => 50,
            ],
            [
                'name' => 'Branch MOA',
                'slug' => 'branch_moa',
                'category' => 'branch',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => false,
                'is_required' => false,
                'sort_order' => 60,
            ],
            [
                'name' => 'Branch Issuing Authority',
                'slug' => 'branch_issuing_authority',
                'category' => 'branch',
                'has_expiry' => false,
                'has_file' => false,
                'has_value' => true,
                'is_required' => true,
                'sort_order' => 70,
            ],

            // =====================================================================
            // OTHER COMMON DOCUMENTS (admin can add more from UI)
            // =====================================================================
            [
                'name' => 'Insurance Certificate',
                'slug' => 'insurance_certificate',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 100,
            ],
            [
                'name' => 'Ejari Contract',
                'slug' => 'ejari_contract',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 110,
            ],
            [
                'name' => 'Establishment Card',
                'slug' => 'establishment_card',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 120,
            ],
            [
                'name' => 'Chamber of Commerce Certificate',
                'slug' => 'chamber_certificate',
                'category' => 'company',
                'has_expiry' => true,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 130,
            ],
            [
                'name' => 'VAT Certificate',
                'slug' => 'vat_certificate',
                'category' => 'company',
                'has_expiry' => false,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 140,
            ],
            [
                'name' => 'Corporate Tax Certificate',
                'slug' => 'ct_certificate',
                'category' => 'company',
                'has_expiry' => false,
                'has_file' => true,
                'has_value' => true,
                'is_required' => false,
                'sort_order' => 150,
            ],
        ];

        foreach ($types as $type) {
            DocumentType::updateOrCreate(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true])
            );
        }
    }
}
