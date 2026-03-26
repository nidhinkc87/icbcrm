<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Comprehensive UAE Tax Consultancy Service Catalog
     *
     * Based on actual services offered by UAE tax/corporate advisory firms.
     * Regulatory bodies: FTA, Ministry of Economy, DED, MOHRE, GDRFA, ICA
     * Currency: AED | Tax ID: TRN (Tax Registration Number)
     */
    public function run(): void
    {
        $services = $this->getServices();

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }

    private function getServices(): array
    {
        return array_merge(
            $this->taxServices(),
            $this->complianceServices(),
            $this->corporateServices(),
            $this->accountingServices(),
            $this->auditServices(),
            $this->advisoryServices(),
        );
    }

    // =========================================================================
    // TAX SERVICES
    // =========================================================================

    private function taxServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 1. VAT Registration
            // -----------------------------------------------------------------
            [
                'name' => 'VAT Registration',
                'description' => 'Registration with the Federal Tax Authority (FTA) for Value Added Tax. Mandatory for businesses with taxable supplies exceeding AED 375,000 annually. Voluntary registration available for businesses exceeding AED 187,500.',
                'form_schema' => [
                    ['name' => 'company_name', 'label' => 'Legal Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => 'As per trade license', 'options' => []],
                    ['name' => 'trade_license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter license number', 'options' => []],
                    ['name' => 'trade_license_copy', 'label' => 'Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'registration_type', 'label' => 'Registration Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select type', 'options' => ['Mandatory', 'Voluntary']],
                    ['name' => 'emirate', 'label' => 'Emirate', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select emirate', 'options' => ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']],
                    ['name' => 'business_category', 'label' => 'Business Activity Category', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select category', 'options' => ['Trading', 'Manufacturing', 'Services', 'Real Estate', 'Hospitality', 'Education', 'Healthcare', 'Construction', 'Transport', 'Other']],
                    ['name' => 'annual_turnover', 'label' => 'Expected Annual Turnover (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'taxable_supplies_value', 'label' => 'Value of Taxable Supplies (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'imports_value', 'label' => 'Value of Imports (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'exports_value', 'label' => 'Value of Exports (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'gcc_supplies', 'label' => 'Has Supplies to/from GCC States', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Check if applicable', 'options' => []],
                    ['name' => 'customs_registration', 'label' => 'Customs Registration Number', 'type' => 'text', 'required' => false, 'placeholder' => 'If registered with customs', 'options' => []],
                    ['name' => 'bank_account_details', 'label' => 'Bank Account IBAN', 'type' => 'text', 'required' => true, 'placeholder' => 'AE00 0000 0000 0000 0000 000', 'options' => []],
                    ['name' => 'authorized_signatory_eid', 'label' => 'Authorized Signatory Emirates ID', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'authorized_signatory_passport', 'label' => 'Authorized Signatory Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'moa_copy', 'label' => 'Memorandum of Association', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'expected_registration_date', 'label' => 'Expected Effective Date of Registration', 'type' => 'date', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Any additional information', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN (Tax Registration Number)', 'type' => 'text', 'required' => true, 'placeholder' => 'FTA-issued TRN', 'options' => []],
                    ['name' => 'vat_certificate', 'label' => 'VAT Registration Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Registration Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'first_filing_period', 'label' => 'First Filing Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Jan-Mar 2026', 'options' => []],
                    ['name' => 'fta_confirmation', 'label' => 'FTA Confirmation Screenshot', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Completion Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 2. VAT Return Filing
            // -----------------------------------------------------------------
            [
                'name' => 'VAT Return Filing',
                'description' => 'Preparation and submission of periodic VAT returns (Form VAT 201) to the FTA. Filing frequency is quarterly or monthly depending on annual turnover. Due within 28 days after the end of each tax period.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Tax Registration Number', 'options' => []],
                    ['name' => 'tax_period', 'label' => 'Tax Period', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select period', 'options' => ['Jan-Mar 2026', 'Apr-Jun 2026', 'Jul-Sep 2026', 'Oct-Dec 2026', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026']],
                    ['name' => 'filing_frequency', 'label' => 'Filing Frequency', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select frequency', 'options' => ['Quarterly', 'Monthly']],
                    ['name' => 'filing_deadline', 'label' => 'Filing Deadline', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'standard_rated_supplies', 'label' => 'Standard Rated Supplies (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'zero_rated_supplies', 'label' => 'Zero Rated Supplies (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'exempt_supplies', 'label' => 'Exempt Supplies (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'reverse_charge_supplies', 'label' => 'Reverse Charge Supplies (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'output_vat', 'label' => 'Output VAT (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'standard_rated_expenses', 'label' => 'Standard Rated Expenses (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'input_vat_recoverable', 'label' => 'Recoverable Input VAT (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'net_vat_due', 'label' => 'Net VAT Due / Refundable (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'sales_ledger', 'label' => 'Sales Ledger / Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'purchase_ledger', 'label' => 'Purchase Ledger / Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_statements', 'label' => 'Bank Statements for the Period', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Adjustments, corrections, or special items', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'vat_return_copy', 'label' => 'Filed VAT Return (Form 201)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_submission_receipt', 'label' => 'FTA Submission Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'transaction_reference', 'label' => 'FTA Transaction Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => 'FTA reference number', 'options' => []],
                    ['name' => 'payment_amount', 'label' => 'VAT Payment Amount (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_confirmation', 'label' => 'Payment Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'filed_date', 'label' => 'Date Filed', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Filing Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 3. VAT Refund Application
            // -----------------------------------------------------------------
            [
                'name' => 'VAT Refund Application',
                'description' => 'Application for VAT refund from the FTA where input VAT exceeds output VAT. Includes refund claims for new businesses, specific schemes (e.g., UAE Nationals building residences, tourists, foreign businesses), and excess credit refunds.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => 'Tax Registration Number', 'options' => []],
                    ['name' => 'refund_type', 'label' => 'Refund Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select refund type', 'options' => ['Excess Input VAT Refund', 'UAE National New Residence', 'Foreign Business Refund', 'Expo/Exhibition Participant', 'Other Special Scheme']],
                    ['name' => 'refund_period', 'label' => 'Refund Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Q1 2026', 'options' => []],
                    ['name' => 'refund_amount', 'label' => 'Refund Amount Claimed (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'reason_for_excess', 'label' => 'Reason for Excess Input VAT', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Explain why input VAT exceeds output VAT', 'options' => []],
                    ['name' => 'supporting_invoices', 'label' => 'Supporting Tax Invoices', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_details_for_refund', 'label' => 'Bank IBAN for Refund', 'type' => 'text', 'required' => true, 'placeholder' => 'AE00 0000 0000 0000 0000 000', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'refund_application_copy', 'label' => 'Submitted Refund Application', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference', 'label' => 'FTA Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'refund_status', 'label' => 'Refund Status', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Submitted', 'Under Review', 'Approved', 'Partially Approved', 'Rejected']],
                    ['name' => 'approved_amount', 'label' => 'Approved Refund Amount (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'fta_decision_letter', 'label' => 'FTA Decision Letter', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'submission_date', 'label' => 'Submission Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 4. Corporate Tax Registration
            // -----------------------------------------------------------------
            [
                'name' => 'Corporate Tax Registration',
                'description' => 'Registration with the FTA for UAE Corporate Tax (CT) under Federal Decree-Law No. 47 of 2022. Applicable to all juridical persons (including free zone entities) and natural persons with business turnover exceeding AED 1 million. Standard rate is 9% on taxable income exceeding AED 375,000.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Legal Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => 'As per trade license', 'options' => []],
                    ['name' => 'trade_license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_license_copy', 'label' => 'Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'entity_type', 'label' => 'Entity Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select entity type', 'options' => ['LLC', 'Sole Establishment', 'Civil Company', 'Free Zone Person (FZP)', 'Free Zone Company (FZCO)', 'Branch of Foreign Company', 'Partnership', 'Private Joint Stock', 'Public Joint Stock', 'Natural Person']],
                    ['name' => 'jurisdiction', 'label' => 'Jurisdiction', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select jurisdiction', 'options' => ['Mainland - Abu Dhabi', 'Mainland - Dubai', 'Mainland - Sharjah', 'Mainland - Ajman', 'Mainland - UAQ', 'Mainland - RAK', 'Mainland - Fujairah', 'DMCC', 'JAFZA', 'DAFZA', 'DIFC', 'ADGM', 'SAIF Zone', 'RAK FTZ', 'IFZA', 'Meydan FZ', 'Hamriyah FZ', 'Sharjah Media City', 'Other Free Zone']],
                    ['name' => 'financial_year_end', 'label' => 'Financial Year End Date', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select FY end', 'options' => ['31 December', '31 March', '30 June', '30 September', 'Other']],
                    ['name' => 'first_tax_period_start', 'label' => 'First Tax Period Start Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'estimated_annual_revenue', 'label' => 'Estimated Annual Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'has_related_parties', 'label' => 'Has Related Parties / Connected Persons', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Check if entity has related parties', 'options' => []],
                    ['name' => 'free_zone_qualifying_income', 'label' => 'Expects to Earn Qualifying Free Zone Income', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Applicable for free zone entities only', 'options' => []],
                    ['name' => 'existing_trn', 'label' => 'Existing TRN (if VAT registered)', 'type' => 'text', 'required' => false, 'placeholder' => 'VAT TRN if already registered', 'options' => []],
                    ['name' => 'moa_copy', 'label' => 'Memorandum of Association / Articles', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'authorized_signatory_eid', 'label' => 'Authorized Signatory Emirates ID', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'authorized_signatory_passport', 'label' => 'Authorized Signatory Passport', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'ct_trn', 'label' => 'Corporate Tax TRN', 'type' => 'text', 'required' => true, 'placeholder' => 'CT registration TRN', 'options' => []],
                    ['name' => 'ct_registration_certificate', 'label' => 'CT Registration Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'registration_effective_date', 'label' => 'Registration Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'first_return_due_date', 'label' => 'First CT Return Due Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_confirmation', 'label' => 'FTA Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 5. Corporate Tax Return Filing
            // -----------------------------------------------------------------
            [
                'name' => 'Corporate Tax Return Filing',
                'description' => 'Preparation and filing of the annual Corporate Tax return with the FTA. Must be filed within 9 months from the end of the relevant tax period. Includes computation of taxable income, applicable reliefs, exemptions, and tax payable.',
                'form_schema' => [
                    ['name' => 'ct_trn', 'label' => 'Corporate Tax TRN', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_period', 'label' => 'Tax Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., 1 Jan 2025 - 31 Dec 2025', 'options' => []],
                    ['name' => 'filing_deadline', 'label' => 'Filing Deadline', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'accounting_income', 'label' => 'Net Accounting Income / (Loss) (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_revenue', 'label' => 'Total Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_expenses', 'label' => 'Total Deductible Expenses (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'non_deductible_expenses', 'label' => 'Non-Deductible Expenses (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'exempt_income', 'label' => 'Exempt Income (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'small_business_relief', 'label' => 'Claiming Small Business Relief (Revenue < AED 3M)', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'related_party_transactions', 'label' => 'Has Related Party Transactions', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'audited_financials', 'label' => 'Audited Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trial_balance', 'label' => 'Trial Balance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_computation_workings', 'label' => 'Tax Computation Supporting Documents', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Adjustments, carry-forward losses, etc.', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'ct_return_copy', 'label' => 'Filed CT Return', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_computation', 'label' => 'Tax Computation Document', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_submission_receipt', 'label' => 'FTA Submission Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference_number', 'label' => 'FTA Transaction Reference', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'taxable_income', 'label' => 'Taxable Income (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'ct_payable', 'label' => 'Corporate Tax Payable (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_confirmation', 'label' => 'Tax Payment Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'filed_date', 'label' => 'Date Filed', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 6. Excise Tax Registration
            // -----------------------------------------------------------------
            [
                'name' => 'Excise Tax Registration',
                'description' => 'Registration with the FTA for Excise Tax on designated goods: tobacco products (100%), carbonated drinks (50%), energy drinks (100%), sweetened drinks (50%), and electronic smoking devices/liquids (100%).',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Legal Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_license_copy', 'label' => 'Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'registrant_type', 'label' => 'Registrant Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select type', 'options' => ['Importer', 'Producer', 'Stockpiler', 'Warehouse Keeper']],
                    ['name' => 'excise_goods_type', 'label' => 'Excise Goods Dealt With', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select goods type', 'options' => ['Tobacco Products', 'Carbonated Drinks', 'Energy Drinks', 'Sweetened Drinks', 'Electronic Smoking Devices', 'Multiple Categories']],
                    ['name' => 'estimated_monthly_volume', 'label' => 'Estimated Monthly Volume (Units)', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'estimated_monthly_value', 'label' => 'Estimated Monthly Value (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'has_designated_zone', 'label' => 'Operates from Designated Zone', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'authorized_signatory_eid', 'label' => 'Authorized Signatory Emirates ID', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'excise_trn', 'label' => 'Excise Tax Registration Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'excise_certificate', 'label' => 'Excise Tax Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_confirmation', 'label' => 'FTA Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 7. Excise Tax Return Filing
            // -----------------------------------------------------------------
            [
                'name' => 'Excise Tax Return Filing',
                'description' => 'Monthly filing of Excise Tax returns (Form EX 201) with the FTA. Due within 15 days after the end of each tax period. Covers all excise goods imported, produced, or released from a designated zone.',
                'form_schema' => [
                    ['name' => 'excise_trn', 'label' => 'Excise Tax Registration Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_period', 'label' => 'Tax Period (Month)', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select month', 'options' => ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026']],
                    ['name' => 'filing_deadline', 'label' => 'Filing Deadline', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_excise_goods_value', 'label' => 'Total Value of Excise Goods (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'excise_tax_due', 'label' => 'Excise Tax Due (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'import_declarations', 'label' => 'Import Declarations', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'stock_records', 'label' => 'Stock Records / Movement Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'excise_return_copy', 'label' => 'Filed Excise Tax Return', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_receipt', 'label' => 'FTA Submission Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference', 'label' => 'FTA Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'payment_confirmation', 'label' => 'Payment Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'filed_date', 'label' => 'Date Filed', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 8. Tax Group Registration (VAT)
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Group Registration',
                'description' => 'Application to the FTA to form a VAT Tax Group where two or more related legal persons can register as a single taxable person. Requires common control (50%+ ownership), common business activity, and all members must be UAE residents.',
                'form_schema' => [
                    ['name' => 'representative_member', 'label' => 'Representative Member (Parent Entity)', 'type' => 'text', 'required' => true, 'placeholder' => 'Entity that will be the representative member', 'options' => []],
                    ['name' => 'representative_trn', 'label' => 'Representative Member TRN', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'number_of_members', 'label' => 'Number of Group Members', 'type' => 'number', 'required' => true, 'placeholder' => '2', 'options' => []],
                    ['name' => 'member_details', 'label' => 'Member Entity Details (Names, TRNs, Ownership %)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'List all member entities with TRNs and ownership percentages', 'options' => []],
                    ['name' => 'group_structure_chart', 'label' => 'Group Structure / Org Chart', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'common_control_evidence', 'label' => 'Evidence of Common Control (MOAs, Share Certificates)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_licenses', 'label' => 'Trade Licenses of All Members', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'business_activities_description', 'label' => 'Description of Common Business Activities', 'type' => 'textarea', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'group_trn', 'label' => 'Tax Group TRN', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'group_certificate', 'label' => 'Tax Group Registration Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_approval_letter', 'label' => 'FTA Approval Letter', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 9. Tax Group Amendment
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Group Amendment',
                'description' => 'Amendment to an existing VAT Tax Group including adding or removing members, changing the representative member, or updating group details with the FTA.',
                'form_schema' => [
                    ['name' => 'group_trn', 'label' => 'Tax Group TRN', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'amendment_type', 'label' => 'Amendment Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select amendment type', 'options' => ['Add Member', 'Remove Member', 'Change Representative Member', 'Update Group Details']],
                    ['name' => 'member_name', 'label' => 'Member Entity Being Added/Removed', 'type' => 'text', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'member_trn', 'label' => 'Member TRN', 'type' => 'text', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'reason_for_amendment', 'label' => 'Reason for Amendment', 'type' => 'textarea', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'amended_certificate', 'label' => 'Amended Group Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_approval', 'label' => 'FTA Approval Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Amendment Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 10. Voluntary Disclosure (VAT/Excise/CT)
            // -----------------------------------------------------------------
            [
                'name' => 'Voluntary Disclosure',
                'description' => 'Filing a Voluntary Disclosure (VD) with the FTA to correct errors in previously filed tax returns (VAT, Excise, or Corporate Tax). Mandatory when the error results in a difference exceeding AED 10,000. Must be filed before the FTA initiates a tax audit.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_type', 'label' => 'Tax Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select tax type', 'options' => ['VAT', 'Excise Tax', 'Corporate Tax']],
                    ['name' => 'original_return_period', 'label' => 'Original Return Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Q1 2025', 'options' => []],
                    ['name' => 'error_description', 'label' => 'Description of Error', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe the error(s) in the original return', 'options' => []],
                    ['name' => 'original_amount', 'label' => 'Original Amount Declared (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'corrected_amount', 'label' => 'Corrected Amount (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'difference_amount', 'label' => 'Difference (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'reason_for_error', 'label' => 'Reason for Error', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select reason', 'options' => ['Calculation Error', 'Classification Error', 'Missed Invoice', 'Duplicate Entry', 'Wrong Tax Period', 'Incorrect Tax Treatment', 'System Error', 'Other']],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents (Invoices, Workings)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'vd_form_copy', 'label' => 'Filed Voluntary Disclosure Form', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference', 'label' => 'FTA VD Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_receipt', 'label' => 'FTA Submission Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'additional_tax_paid', 'label' => 'Additional Tax Paid (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'penalty_amount', 'label' => 'Penalty Amount (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_confirmation', 'label' => 'Payment Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'filed_date', 'label' => 'Date Filed', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 11. Tax Deregistration (VAT/Excise/CT)
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Deregistration',
                'description' => 'Application to deregister from VAT, Excise Tax, or Corporate Tax with the FTA. Required when a business ceases to exist, taxable supplies fall below the voluntary threshold, or the entity is being liquidated. Must be applied for within 20 business days of the triggering event.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_type', 'label' => 'Tax Type for Deregistration', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select tax type', 'options' => ['VAT', 'Excise Tax', 'Corporate Tax']],
                    ['name' => 'deregistration_reason', 'label' => 'Reason for Deregistration', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select reason', 'options' => ['Business Ceased', 'Below Voluntary Threshold', 'Entity Liquidation', 'License Cancelled', 'No Longer Making Taxable Supplies', 'Other']],
                    ['name' => 'reason_details', 'label' => 'Details of Reason', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Provide details supporting deregistration', 'options' => []],
                    ['name' => 'last_supply_date', 'label' => 'Date of Last Taxable Supply', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'turnover_last_12_months', 'label' => 'Turnover in Last 12 Months (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'expected_turnover_next_30_days', 'label' => 'Expected Turnover Next 30 Days (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'assets_on_hand_value', 'label' => 'Value of Assets on Hand (AED)', 'type' => 'number', 'required' => false, 'placeholder' => 'For VAT on capital assets adjustment', 'options' => []],
                    ['name' => 'all_returns_filed', 'label' => 'All Tax Returns Filed Up to Date', 'type' => 'checkbox', 'required' => true, 'placeholder' => 'Confirm all returns have been filed', 'options' => []],
                    ['name' => 'outstanding_liability', 'label' => 'Outstanding Tax Liability (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'deregistration_confirmation', 'label' => 'FTA Deregistration Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference', 'label' => 'FTA Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Deregistration Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'final_return_filed', 'label' => 'Final Return Filed', 'type' => 'checkbox', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'final_return_copy', 'label' => 'Final Return Copy', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 12. Tax Agent Registration / Renewal
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Agent Registration',
                'description' => 'Registration or renewal of Tax Agent status with the FTA. Tax agents are approved by the FTA to act on behalf of taxpayers for tax-related matters. Requires qualifying qualifications and experience as per FTA Tax Agent requirements.',
                'form_schema' => [
                    ['name' => 'agent_name', 'label' => 'Applicant Full Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'application_type', 'label' => 'Application Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['New Registration', 'Renewal']],
                    ['name' => 'existing_tan', 'label' => 'Existing Tax Agent Number (for renewal)', 'type' => 'text', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'qualification', 'label' => 'Professional Qualification', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['CA', 'CPA', 'ACCA', 'CMA', 'Bachelor in Accounting/Tax', 'Master in Accounting/Tax', 'Legal Degree', 'Other']],
                    ['name' => 'years_of_experience', 'label' => 'Years of Tax Experience', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'qualification_certificates', 'label' => 'Qualification Certificates', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_copy', 'label' => 'Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'emirates_id', 'label' => 'Emirates ID Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'professional_indemnity_insurance', 'label' => 'Professional Indemnity Insurance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'cv', 'label' => 'Curriculum Vitae', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'tax_agent_number', 'label' => 'Tax Agent Number (TAN)', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'agent_certificate', 'label' => 'Tax Agent Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'approval_date', 'label' => 'Approval Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'expiry_date', 'label' => 'Certificate Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_confirmation', 'label' => 'FTA Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 13. FTA Penalty Reconsideration
            // -----------------------------------------------------------------
            [
                'name' => 'FTA Penalty Reconsideration',
                'description' => 'Filing a reconsideration request with the FTA against imposed administrative penalties. Must be submitted within 40 business days from the date of notification. If rejected, can be escalated to the Tax Disputes Resolution Committee (TDRC) within 40 business days.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'penalty_reference', 'label' => 'Penalty Assessment Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => 'From FTA penalty notification', 'options' => []],
                    ['name' => 'penalty_notification_date', 'label' => 'Penalty Notification Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'penalty_type', 'label' => 'Penalty Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select penalty type', 'options' => ['Late Registration', 'Late Filing', 'Late Payment', 'Incorrect Return', 'Failure to Display TRN', 'Failure to Issue Tax Invoice', 'Failure to Keep Records', 'Tax Evasion', 'Other']],
                    ['name' => 'penalty_amount', 'label' => 'Penalty Amount (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'grounds_for_reconsideration', 'label' => 'Grounds for Reconsideration', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Detailed grounds explaining why the penalty should be reconsidered', 'options' => []],
                    ['name' => 'penalty_notification', 'label' => 'Penalty Notification Letter', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'supporting_evidence', 'label' => 'Supporting Evidence / Documents', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'authorized_signatory_poa', 'label' => 'Power of Attorney (if applicable)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'reconsideration_form', 'label' => 'Filed Reconsideration Form', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_reference', 'label' => 'FTA Reconsideration Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'submission_date', 'label' => 'Submission Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_decision', 'label' => 'FTA Decision', 'type' => 'dropdown', 'required' => false, 'placeholder' => '', 'options' => ['Pending', 'Fully Accepted', 'Partially Accepted', 'Rejected']],
                    ['name' => 'revised_penalty_amount', 'label' => 'Revised Penalty Amount (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'fta_decision_letter', 'label' => 'FTA Decision Letter', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'escalate_to_tdrc', 'label' => 'Escalate to TDRC', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'If reconsideration is rejected', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 14. Tax Residency Certificate (TRC)
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Residency Certificate',
                'description' => 'Application for a Tax Residency Certificate (also called Tax Domicile Certificate) from the FTA. Required by companies and individuals to avail benefits under Double Taxation Avoidance Agreements (DTAAs). Valid for one year.',
                'form_schema' => [
                    ['name' => 'applicant_type', 'label' => 'Applicant Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Company / Legal Person', 'Individual / Natural Person']],
                    ['name' => 'applicant_name', 'label' => 'Applicant Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => false, 'placeholder' => 'If registered', 'options' => []],
                    ['name' => 'purpose_country', 'label' => 'Country for Which TRC is Required', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., India, UK, Germany', 'options' => []],
                    ['name' => 'purpose', 'label' => 'Purpose of TRC', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['DTAA Benefit', 'Bank / Financial Institution Requirement', 'Foreign Authority Requirement', 'Other']],
                    ['name' => 'trade_license_copy', 'label' => 'Trade License Copy (Company)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'audited_financials', 'label' => 'Audited Financial Statements', 'type' => 'file', 'required' => false, 'placeholder' => 'For companies', 'options' => []],
                    ['name' => 'tenancy_contract', 'label' => 'Tenancy / Ejari Contract', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_statement', 'label' => 'UAE Bank Statement (6 months)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_copy', 'label' => 'Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_copy', 'label' => 'UAE Residence Visa Copy', 'type' => 'file', 'required' => false, 'placeholder' => 'For individuals', 'options' => []],
                    ['name' => 'emirates_id', 'label' => 'Emirates ID Copy', 'type' => 'file', 'required' => false, 'placeholder' => 'For individuals', 'options' => []],
                    ['name' => 'entry_exit_report', 'label' => 'Entry/Exit Report (ICA)', 'type' => 'file', 'required' => false, 'placeholder' => 'For individuals - 183 days presence proof', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'trc_certificate', 'label' => 'Tax Residency Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trc_reference', 'label' => 'TRC Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'issue_date', 'label' => 'Issue Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'expiry_date', 'label' => 'Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 15. FTA Tax Registration Amendment
            // -----------------------------------------------------------------
            [
                'name' => 'FTA Tax Registration Amendment',
                'description' => 'Amendment of tax registration details with the FTA, including changes to trade name, address, business activities, authorized signatory, bank details, or contact information. Must be updated within 20 business days of any change.',
                'form_schema' => [
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_type', 'label' => 'Registration Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['VAT', 'Corporate Tax', 'Excise Tax']],
                    ['name' => 'amendment_category', 'label' => 'What Needs to be Changed', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select category', 'options' => ['Trade Name / Legal Name', 'Registered Address', 'Business Activities', 'Authorized Signatory', 'Bank Details', 'Contact Details (Email/Phone)', 'Financial Year End', 'Multiple Changes']],
                    ['name' => 'current_details', 'label' => 'Current Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe current registered details', 'options' => []],
                    ['name' => 'new_details', 'label' => 'New / Updated Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe the changes required', 'options' => []],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents (New License, EID, etc.)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'updated_certificate', 'label' => 'Updated Registration Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_confirmation', 'label' => 'FTA Amendment Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Amendment Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }

    // =========================================================================
    // COMPLIANCE SERVICES
    // =========================================================================

    private function complianceServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 16. ESR Notification Filing
            // -----------------------------------------------------------------
            [
                'name' => 'ESR Notification Filing',
                'description' => 'Filing the annual Economic Substance Regulations (ESR) Notification with the Ministry of Economy (MoF portal). All UAE onshore and free zone licensees conducting a Relevant Activity must file within 6 months after the financial year end. Relevant Activities include: Banking, Insurance, Investment Fund Management, Lease-Finance, Headquarters, Shipping, Holding Company, IP, and Distribution & Service Centre.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_year_end', 'label' => 'Financial Year End Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_deadline', 'label' => 'Filing Deadline', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'relevant_activity', 'label' => 'Relevant Activity', 'type' => 'dropdown', 'required' => true, 'placeholder' => 'Select relevant activity', 'options' => ['Banking', 'Insurance', 'Investment Fund Management', 'Lease-Finance', 'Headquarters', 'Shipping', 'Holding Company', 'Intellectual Property (IP)', 'Distribution & Service Centre', 'None (No Relevant Activity)']],
                    ['name' => 'earned_income_from_activity', 'label' => 'Earned Income from Relevant Activity', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Did the entity earn income from the activity?', 'options' => []],
                    ['name' => 'gross_income', 'label' => 'Gross Income from Relevant Activity (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'is_tax_resident_outside_uae', 'label' => 'Tax Resident Outside UAE', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Is the entity tax resident in another jurisdiction?', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'notification_confirmation', 'label' => 'ESR Notification Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'mof_reference', 'label' => 'MoF Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_date', 'label' => 'Filing Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'esr_report_required', 'label' => 'ESR Report Required', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'Does the entity need to file an ESR Report?', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 17. ESR Report Filing
            // -----------------------------------------------------------------
            [
                'name' => 'ESR Report Filing',
                'description' => 'Filing the annual ESR Report with the Ministry of Economy for entities that earned income from a Relevant Activity. Must be filed within 12 months after the financial year end. Requires detailed information about employees, expenditure, assets, and core income-generating activities (CIGA) conducted in the UAE.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_year_end', 'label' => 'Financial Year End Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'relevant_activity', 'label' => 'Relevant Activity', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Banking', 'Insurance', 'Investment Fund Management', 'Lease-Finance', 'Headquarters', 'Shipping', 'Holding Company', 'Intellectual Property (IP)', 'Distribution & Service Centre']],
                    ['name' => 'number_of_ftees', 'label' => 'Number of Full-Time Employees in UAE', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'operating_expenditure', 'label' => 'Operating Expenditure in UAE (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_assets_value', 'label' => 'Value of Assets in UAE (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'net_income', 'label' => 'Net Income from Relevant Activity (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'ciga_details', 'label' => 'Core Income Generating Activities (CIGA) Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe CIGAs performed in the UAE', 'options' => []],
                    ['name' => 'outsourcing_details', 'label' => 'Outsourcing Arrangements', 'type' => 'textarea', 'required' => false, 'placeholder' => 'If any CIGA is outsourced, provide details', 'options' => []],
                    ['name' => 'financial_statements', 'label' => 'Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'org_chart', 'label' => 'Organization Chart', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'esr_report_confirmation', 'label' => 'ESR Report Submission Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'mof_reference', 'label' => 'MoF Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_date', 'label' => 'Filing Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'substance_test_result', 'label' => 'Substance Test Assessment', 'type' => 'dropdown', 'required' => false, 'placeholder' => '', 'options' => ['Adequate Substance', 'Insufficient Substance - Action Required', 'Pending Review']],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 18. UBO Declaration Filing
            // -----------------------------------------------------------------
            [
                'name' => 'UBO Declaration Filing',
                'description' => 'Filing the Ultimate Beneficial Owner (UBO) declaration with the relevant authority (Ministry of Economy for mainland, respective free zone for FZ entities) as per Cabinet Resolution No. 58 of 2020. All UAE companies must maintain a register of UBOs, partners, and nominees and file the same with their licensing authority.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'licensing_authority', 'label' => 'Licensing Authority', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['DED Dubai', 'DED Abu Dhabi', 'DED Sharjah', 'DED Ajman', 'DED UAQ', 'DED RAK', 'DED Fujairah', 'DMCC', 'JAFZA', 'DAFZA', 'DIFC', 'ADGM', 'SAIF Zone', 'RAK FTZ', 'IFZA', 'Other Free Zone']],
                    ['name' => 'entity_legal_form', 'label' => 'Legal Form', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['LLC', 'Sole Establishment', 'Civil Company', 'Partnership', 'Private Joint Stock', 'Public Joint Stock', 'Branch', 'Free Zone Entity']],
                    ['name' => 'ubo_details', 'label' => 'UBO Details (Name, Nationality, DOB, Ownership %, Address)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Provide full details of each UBO with 25%+ ownership or significant control', 'options' => []],
                    ['name' => 'number_of_ubos', 'label' => 'Number of UBOs', 'type' => 'number', 'required' => true, 'placeholder' => '1', 'options' => []],
                    ['name' => 'ubo_passport_copies', 'label' => 'UBO Passport Copies', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'ubo_proof_of_address', 'label' => 'UBO Proof of Address', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'share_certificate', 'label' => 'Share Certificate / MOA', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'corporate_structure_chart', 'label' => 'Corporate Structure Chart', 'type' => 'file', 'required' => false, 'placeholder' => 'For complex ownership structures', 'options' => []],
                    ['name' => 'nominee_details', 'label' => 'Nominee Arrangements (if any)', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'ubo_register', 'label' => 'UBO Register Document', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_confirmation', 'label' => 'Authority Filing Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'reference_number', 'label' => 'Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_date', 'label' => 'Filing Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 19. AML Compliance Setup
            // -----------------------------------------------------------------
            [
                'name' => 'AML Compliance Setup',
                'description' => 'Setup and implementation of Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) compliance framework as per UAE Federal Decree-Law No. 20 of 2018. Includes AML policy drafting, risk assessment, KYC procedures, suspicious transaction reporting (STR/SAR) framework, and staff training. Applies to DNFBPs (Designated Non-Financial Businesses and Professions).',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'business_type', 'label' => 'Business Type / DNFBP Category', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Real Estate Broker/Agent', 'Dealer in Precious Metals/Stones', 'Auditor/Accountant', 'Corporate Service Provider', 'Legal Professional', 'Trust Service Provider', 'Other DNFBP', 'Non-DNFBP (Voluntary)']],
                    ['name' => 'number_of_employees', 'label' => 'Number of Employees', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'compliance_officer_name', 'label' => 'Designated Compliance Officer Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'existing_aml_policy', 'label' => 'Has Existing AML Policy', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'existing_policy_document', 'label' => 'Existing AML Policy (if any)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'goaml_registered', 'label' => 'Registered on goAML Portal', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'UAE FIU reporting portal', 'options' => []],
                    ['name' => 'services_description', 'label' => 'Description of Services/Products Offered', 'type' => 'textarea', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'client_base_description', 'label' => 'Description of Client Base', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Jurisdictions, types of clients, risk profile', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'aml_policy_document', 'label' => 'AML/CFT Policy & Procedures Manual', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'risk_assessment_report', 'label' => 'Business Risk Assessment Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'kyc_templates', 'label' => 'KYC/CDD Templates & Checklists', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'str_procedures', 'label' => 'STR/SAR Reporting Procedures', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'training_material', 'label' => 'Staff Training Material', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'goaml_registration', 'label' => 'goAML Registration Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'delivery_date', 'label' => 'Delivery Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 20. Country-by-Country Reporting (CbCR)
            // -----------------------------------------------------------------
            [
                'name' => 'Country-by-Country Reporting (CbCR)',
                'description' => 'Preparation and filing of Country-by-Country Report with the Ministry of Finance for multinational enterprise (MNE) groups with consolidated group revenue of AED 3.15 billion or more. Filed as part of UAE participation in OECD BEPS Action 13. Includes CbCR notification and the actual CbC report.',
                'form_schema' => [
                    ['name' => 'mne_group_name', 'label' => 'MNE Group Name', 'type' => 'text', 'required' => true, 'placeholder' => 'Ultimate parent entity name', 'options' => []],
                    ['name' => 'reporting_entity', 'label' => 'UAE Reporting Entity', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'reporting_entity_role', 'label' => 'Reporting Role', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Ultimate Parent Entity (UPE)', 'Surrogate Parent Entity', 'Constituent Entity (Notification Only)']],
                    ['name' => 'fiscal_year', 'label' => 'Reporting Fiscal Year', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., FY 2025', 'options' => []],
                    ['name' => 'consolidated_revenue', 'label' => 'Consolidated Group Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'number_of_jurisdictions', 'label' => 'Number of Jurisdictions', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'jurisdictions_list', 'label' => 'List of Jurisdictions', 'type' => 'textarea', 'required' => true, 'placeholder' => 'List all jurisdictions where the MNE group operates', 'options' => []],
                    ['name' => 'consolidated_financials', 'label' => 'Consolidated Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'entity_wise_data', 'label' => 'Entity-wise Financial Data (Revenue, Profit, Tax, Employees)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'cbcr_notification', 'label' => 'CbCR Notification Filed', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'cbcr_report', 'label' => 'CbC Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'mof_reference', 'label' => 'MoF Reference Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'filing_date', 'label' => 'Filing Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }

    // =========================================================================
    // CORPORATE SERVICES
    // =========================================================================

    private function corporateServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 21. Trade License Renewal
            // -----------------------------------------------------------------
            [
                'name' => 'Trade License Renewal',
                'description' => 'Annual renewal of trade license with the relevant licensing authority (DED for mainland, respective free zone authority for FZ entities). Includes clearance from all connected government departments and payment of fees.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'current_license_copy', 'label' => 'Current Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_type', 'label' => 'License Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Commercial', 'Professional', 'Industrial', 'Tourism', 'Crafts', 'Agricultural', 'E-Commerce']],
                    ['name' => 'jurisdiction', 'label' => 'Jurisdiction', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['DED Dubai', 'DED Abu Dhabi', 'DED Sharjah', 'DED Ajman', 'DED UAQ', 'DED RAK', 'DED Fujairah', 'DMCC', 'JAFZA', 'DAFZA', 'DIFC', 'ADGM', 'SAIF Zone', 'RAK FTZ', 'IFZA', 'Meydan FZ', 'Hamriyah FZ', 'Other Free Zone']],
                    ['name' => 'expiry_date', 'label' => 'Current License Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'activities_change', 'label' => 'Any Change in Business Activities', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'activities_change_details', 'label' => 'Activity Change Details', 'type' => 'textarea', 'required' => false, 'placeholder' => 'If adding/removing activities, specify here', 'options' => []],
                    ['name' => 'tenancy_contract', 'label' => 'Ejari / Tenancy Contract', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'partners_eid', 'label' => 'Partners/Shareholders Emirates ID Copies', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'existing_approvals', 'label' => 'Existing External Approvals (if activity-specific)', 'type' => 'file', 'required' => false, 'placeholder' => 'e.g., DHA, KHDA, RERA approvals', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'renewed_license', 'label' => 'Renewed Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'new_expiry_date', 'label' => 'New Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'renewal_receipt', 'label' => 'Payment Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_fees_paid', 'label' => 'Total Fees Paid (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 22. Company Formation - Mainland
            // -----------------------------------------------------------------
            [
                'name' => 'Company Formation - Mainland',
                'description' => 'Incorporation and registration of a new mainland company with the Department of Economic Development (DED). Covers LLC, Sole Establishment, Civil Company, and Branch Office formations. Includes initial name approval, MOA drafting, activity selection, and license issuance.',
                'form_schema' => [
                    ['name' => 'proposed_company_name', 'label' => 'Proposed Company Name (3 options)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Provide 3 name options in order of preference', 'options' => []],
                    ['name' => 'legal_form', 'label' => 'Legal Form', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['LLC (Limited Liability Company)', 'Sole Establishment', 'Civil Company', 'Branch of Foreign Company', 'Branch of UAE Company', 'Branch of GCC Company', 'Partnership']],
                    ['name' => 'emirate', 'label' => 'Emirate of Incorporation', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']],
                    ['name' => 'business_activities', 'label' => 'Business Activities (ISIC Codes if known)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'List all desired business activities', 'options' => []],
                    ['name' => 'shareholder_details', 'label' => 'Shareholder Details (Name, Nationality, Ownership %)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Full details of all shareholders', 'options' => []],
                    ['name' => 'number_of_shareholders', 'label' => 'Number of Shareholders', 'type' => 'number', 'required' => true, 'placeholder' => '1', 'options' => []],
                    ['name' => 'share_capital', 'label' => 'Share Capital (AED)', 'type' => 'number', 'required' => false, 'placeholder' => 'If applicable', 'options' => []],
                    ['name' => 'manager_name', 'label' => 'Proposed Manager / General Manager', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'shareholder_passports', 'label' => 'Shareholder Passport Copies', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'shareholder_eids', 'label' => 'Shareholder Emirates ID Copies (if UAE residents)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'no_objection_letter', 'label' => 'NOC from Current Sponsor (if applicable)', 'type' => 'file', 'required' => false, 'placeholder' => 'For UAE residents changing sponsorship', 'options' => []],
                    ['name' => 'office_address', 'label' => 'Proposed Office Address', 'type' => 'textarea', 'required' => false, 'placeholder' => 'If already secured', 'options' => []],
                    ['name' => 'requires_external_approval', 'label' => 'Activity Requires External Approval', 'type' => 'checkbox', 'required' => false, 'placeholder' => 'e.g., DHA, RERA, SCA approvals', 'options' => []],
                    ['name' => 'visa_quota_needed', 'label' => 'Number of Visas Required', 'type' => 'number', 'required' => false, 'placeholder' => '0', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'trade_license', 'label' => 'Issued Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'moa_signed', 'label' => 'Signed Memorandum of Association', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'establishment_card', 'label' => 'Establishment Card / Immigration Card', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'initial_approval', 'label' => 'Initial Approval Document', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'incorporation_date', 'label' => 'Date of Incorporation', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_setup_cost', 'label' => 'Total Setup Cost (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_receipts', 'label' => 'Payment Receipts', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 23. Company Formation - Free Zone
            // -----------------------------------------------------------------
            [
                'name' => 'Company Formation - Free Zone',
                'description' => 'Incorporation and registration of a new free zone entity (FZE, FZCO, or Branch) with a UAE free zone authority. Includes application processing, share capital requirements, office/desk allocation, and license issuance. 100% foreign ownership permitted.',
                'form_schema' => [
                    ['name' => 'proposed_company_name', 'label' => 'Proposed Company Name (3 options)', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Provide 3 name options', 'options' => []],
                    ['name' => 'free_zone', 'label' => 'Free Zone', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['DMCC', 'JAFZA', 'DAFZA', 'DIFC', 'ADGM', 'SAIF Zone (Sharjah)', 'RAK FTZ', 'RAK ICC', 'IFZA', 'Meydan FZ', 'Hamriyah FZ', 'Dubai Silicon Oasis', 'Dubai Internet City', 'Dubai Media City', 'Dubai Studio City', 'twofour54 (Abu Dhabi)', 'Khalifa Industrial Zone (KIZAD)', 'Abu Dhabi Airport FZ', 'Masdar City FZ', 'Sharjah Media City (Shams)', 'Ajman Free Zone', 'UAQ Free Zone', 'Fujairah Free Zone', 'Other']],
                    ['name' => 'entity_type', 'label' => 'Entity Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['FZE (Single Shareholder)', 'FZCO (Multiple Shareholders)', 'Branch of Foreign Company', 'Branch of UAE Company']],
                    ['name' => 'license_type', 'label' => 'License Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Trading', 'Service', 'Industrial / Manufacturing', 'Consultancy', 'E-Commerce', 'Media', 'Education', 'Dual (Trading + Service)']],
                    ['name' => 'business_activities', 'label' => 'Business Activities', 'type' => 'textarea', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'shareholder_details', 'label' => 'Shareholder Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Name, nationality, passport number, ownership %', 'options' => []],
                    ['name' => 'share_capital', 'label' => 'Share Capital (AED)', 'type' => 'number', 'required' => false, 'placeholder' => 'As per free zone requirement', 'options' => []],
                    ['name' => 'office_type', 'label' => 'Office Type Required', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Flexi Desk / Hot Desk', 'Dedicated Desk', 'Smart Office', 'Serviced Office', 'Warehouse', 'Industrial Unit', 'Not Required']],
                    ['name' => 'visa_quota', 'label' => 'Visa Quota Required', 'type' => 'number', 'required' => false, 'placeholder' => '0', 'options' => []],
                    ['name' => 'shareholder_passports', 'label' => 'Shareholder Passport Copies', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'shareholder_photos', 'label' => 'Shareholder Passport-size Photos', 'type' => 'image', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'parent_company_docs', 'label' => 'Parent Company Documents (for Branch)', 'type' => 'file', 'required' => false, 'placeholder' => 'Trade license, COI, Board Resolution', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'trade_license', 'label' => 'Free Zone Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'certificate_of_incorporation', 'label' => 'Certificate of Incorporation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'share_certificate', 'label' => 'Share Certificate', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'moa_aoa', 'label' => 'MOA/AOA', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'lease_agreement', 'label' => 'Office Lease Agreement', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'establishment_card', 'label' => 'Establishment Card', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'incorporation_date', 'label' => 'Date of Incorporation', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_setup_cost', 'label' => 'Total Setup Cost (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_receipts', 'label' => 'Payment Receipts', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 24. Trade License Amendment
            // -----------------------------------------------------------------
            [
                'name' => 'Trade License Amendment',
                'description' => 'Amendment to an existing trade license including change of company name, addition/removal of business activities, change of legal form, change of shareholders/partners, change of manager, or address change.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Current Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'current_license_copy', 'label' => 'Current Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'amendment_type', 'label' => 'Amendment Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Company Name Change', 'Add Business Activity', 'Remove Business Activity', 'Change Legal Form', 'Add Shareholder/Partner', 'Remove Shareholder/Partner', 'Change of Manager', 'Address Change', 'Share Transfer', 'Capital Change', 'Multiple Amendments']],
                    ['name' => 'amendment_details', 'label' => 'Amendment Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe exact changes required', 'options' => []],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents', 'type' => 'file', 'required' => true, 'placeholder' => 'NOC, Board Resolution, new MOA, etc.', 'options' => []],
                    ['name' => 'current_moa', 'label' => 'Current MOA/AOA', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'amended_license', 'label' => 'Amended Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'amended_moa', 'label' => 'Amended MOA/AOA', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'amendment_certificate', 'label' => 'Amendment Certificate / Confirmation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'effective_date', 'label' => 'Amendment Effective Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fees_paid', 'label' => 'Fees Paid (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'payment_receipt', 'label' => 'Payment Receipt', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 25. Company Liquidation / Deregistration
            // -----------------------------------------------------------------
            [
                'name' => 'Company Liquidation',
                'description' => 'Full company liquidation and deregistration process including winding up affairs, settling liabilities, cancelling the trade license, deregistering with FTA, and obtaining final clearances from all government authorities (MOHRE, GDRFA, DED/Free Zone, FTA).',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'jurisdiction', 'label' => 'Jurisdiction', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Mainland', 'Free Zone']],
                    ['name' => 'licensing_authority', 'label' => 'Licensing Authority', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., DED Dubai, DMCC, JAFZA', 'options' => []],
                    ['name' => 'reason_for_liquidation', 'label' => 'Reason for Liquidation', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Voluntary Closure', 'Shareholders Decision', 'Expiry of Duration', 'Court Order', 'Merger', 'Other']],
                    ['name' => 'has_active_visas', 'label' => 'Has Active Employee Visas', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'number_of_active_visas', 'label' => 'Number of Active Visas', 'type' => 'number', 'required' => false, 'placeholder' => '0', 'options' => []],
                    ['name' => 'has_outstanding_liabilities', 'label' => 'Has Outstanding Liabilities', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'trn_number', 'label' => 'TRN Number (if tax registered)', 'type' => 'text', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'all_tax_returns_filed', 'label' => 'All Tax Returns Filed', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'current_license_copy', 'label' => 'Current Trade License', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'board_resolution', 'label' => 'Board Resolution / Shareholder Decision for Liquidation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'latest_financials', 'label' => 'Latest Financial Statements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'license_cancellation', 'label' => 'License Cancellation Certificate', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_deregistration', 'label' => 'FTA Deregistration Confirmation', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'mohre_clearance', 'label' => 'MOHRE Clearance', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'immigration_clearance', 'label' => 'Immigration (GDRFA) Clearance', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'liquidation_report', 'label' => 'Liquidation Report', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'cancellation_date', 'label' => 'Cancellation Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 26. PRO Services (Government Liaison)
            // -----------------------------------------------------------------
            [
                'name' => 'PRO Services',
                'description' => 'Public Relations Officer (PRO) services for government liaison and document processing. Includes document typing, submissions to government departments (DED, MOHRE, GDRFA, Municipality, Tasheel, Tawjeeh), document attestation, and general government-related errands.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Trade License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'service_type', 'label' => 'PRO Service Required', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Document Typing', 'Government Submission', 'Document Collection', 'Document Attestation', 'Tasheel Service', 'Tawjeeh Service', 'Municipality Approval', 'Chamber of Commerce', 'Legal Translation', 'General Government Liaison', 'Other']],
                    ['name' => 'government_department', 'label' => 'Government Department', 'type' => 'dropdown', 'required' => false, 'placeholder' => '', 'options' => ['DED', 'MOHRE', 'GDRFA', 'ICA', 'Municipality', 'Tasheel', 'Courts', 'Notary Public', 'MOFA', 'Embassy/Consulate', 'Chamber of Commerce', 'Other']],
                    ['name' => 'service_description', 'label' => 'Detailed Service Description', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe exactly what needs to be done', 'options' => []],
                    ['name' => 'documents_provided', 'label' => 'Documents Provided', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'urgency', 'label' => 'Urgency Level', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Standard', 'Urgent', 'Express/Same Day']],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'completed_documents', 'label' => 'Completed / Processed Documents', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'government_receipt', 'label' => 'Government Receipt / Acknowledgment', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'fees_paid', 'label' => 'Government Fees Paid (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 27. Employment Visa Processing
            // -----------------------------------------------------------------
            [
                'name' => 'Employment Visa Processing',
                'description' => 'End-to-end employment visa processing including entry permit application, status change, medical fitness test, Emirates ID application, and visa stamping. Involves MOHRE for work permit and GDRFA for residence visa.',
                'form_schema' => [
                    ['name' => 'company_name', 'label' => 'Sponsoring Company Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'Company License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'establishment_card_number', 'label' => 'Establishment Card / MOHRE Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_type', 'label' => 'Visa Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['New Employment Visa', 'Visa Renewal', 'Status Change (Visit to Employment)', 'Green Visa', 'Golden Visa', 'Investor Visa']],
                    ['name' => 'employee_name', 'label' => 'Employee Full Name (as per passport)', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'nationality', 'label' => 'Nationality', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_copy', 'label' => 'Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_photo', 'label' => 'Passport-size Photo (White Background)', 'type' => 'image', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'job_title', 'label' => 'Job Title', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'salary', 'label' => 'Basic Salary (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_package', 'label' => 'Total Salary Package (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'offer_letter', 'label' => 'Offer Letter / Employment Contract', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'educational_certificates', 'label' => 'Educational Certificates (Attested)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'previous_visa_copy', 'label' => 'Previous Visa Copy (for renewal/status change)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'entry_permit', 'label' => 'Entry Permit', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'work_permit', 'label' => 'MOHRE Work Permit', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'residence_visa', 'label' => 'Residence Visa (Stamped)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'emirates_id', 'label' => 'Emirates ID', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'labour_contract', 'label' => 'Registered Labour Contract', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'medical_fitness', 'label' => 'Medical Fitness Certificate', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_uid', 'label' => 'Visa UID Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_expiry_date', 'label' => 'Visa Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_cost', 'label' => 'Total Processing Cost (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 28. Visa Cancellation
            // -----------------------------------------------------------------
            [
                'name' => 'Visa Cancellation',
                'description' => 'Processing of employment visa cancellation including MOHRE work permit cancellation, GDRFA residence visa cancellation, and final settlement coordination. Applicable for employee termination, resignation, or company closure.',
                'form_schema' => [
                    ['name' => 'company_name', 'label' => 'Company Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'employee_name', 'label' => 'Employee Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_uid', 'label' => 'Visa UID Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_copy', 'label' => 'Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_copy', 'label' => 'Current Visa Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'emirates_id_copy', 'label' => 'Emirates ID Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'cancellation_reason', 'label' => 'Cancellation Reason', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Resignation', 'Termination', 'End of Contract', 'Company Closure', 'Transfer to New Employer', 'Other']],
                    ['name' => 'last_working_day', 'label' => 'Last Working Day', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'cancellation_type', 'label' => 'Cancellation Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Inside Country (Cancel)', 'Outside Country (Absconding/No Show)']],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'mohre_cancellation', 'label' => 'MOHRE Work Permit Cancellation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_cancellation_stamp', 'label' => 'Visa Cancellation Stamp/Paper', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'grace_period_end', 'label' => 'Grace Period End Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'cancellation_date', 'label' => 'Cancellation Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_cost', 'label' => 'Total Cost (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 29. Golden Visa Application
            // -----------------------------------------------------------------
            [
                'name' => 'Golden Visa Application',
                'description' => 'Application for UAE Golden Visa (5 or 10 year long-term residence visa) for investors, entrepreneurs, specialized talents, researchers, and outstanding students. Processed through ICA (Federal Authority for Identity, Citizenship, Customs and Port Security).',
                'form_schema' => [
                    ['name' => 'applicant_name', 'label' => 'Applicant Full Name', 'type' => 'text', 'required' => true, 'placeholder' => 'As per passport', 'options' => []],
                    ['name' => 'nationality', 'label' => 'Nationality', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'category', 'label' => 'Golden Visa Category', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Investor (Real Estate AED 2M+)', 'Investor (Business/Deposit)', 'Entrepreneur', 'Specialized Talent / Professional', 'Scientist / Researcher', 'Outstanding Student', 'Humanitarian Pioneer', 'Skilled Employee (Salary AED 30K+)']],
                    ['name' => 'visa_duration', 'label' => 'Visa Duration', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['5 Years', '10 Years']],
                    ['name' => 'passport_copy', 'label' => 'Passport Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'passport_photo', 'label' => 'Photo (White Background)', 'type' => 'image', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'current_visa_copy', 'label' => 'Current UAE Visa (if applicable)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'emirates_id', 'label' => 'Emirates ID Copy (if applicable)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'proof_of_eligibility', 'label' => 'Proof of Eligibility (Investment proof, salary certificate, etc.)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'health_insurance', 'label' => 'Health Insurance Policy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'include_dependents', 'label' => 'Include Dependents', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'dependent_details', 'label' => 'Dependent Details (if applicable)', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Names, relationship, passport details', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'golden_visa', 'label' => 'Golden Visa Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_uid', 'label' => 'Visa UID Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'emirates_id', 'label' => 'Emirates ID', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'visa_expiry_date', 'label' => 'Visa Expiry Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'dependent_visas', 'label' => 'Dependent Visa Copies', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_cost', 'label' => 'Total Cost (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }

    // =========================================================================
    // ACCOUNTING SERVICES
    // =========================================================================

    private function accountingServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 30. Bookkeeping Services
            // -----------------------------------------------------------------
            [
                'name' => 'Bookkeeping',
                'description' => 'Ongoing bookkeeping and accounting record maintenance including recording financial transactions, bank reconciliation, accounts receivable/payable management, and maintaining the general ledger. Supports VAT-compliant record keeping as required by the FTA.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'period', 'label' => 'Accounting Period', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']],
                    ['name' => 'accounting_software', 'label' => 'Accounting Software', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Zoho Books', 'QuickBooks', 'Xero', 'Tally', 'SAP', 'FreshBooks', 'Wave', 'Sage', 'Excel/Manual', 'Other']],
                    ['name' => 'bank_statements', 'label' => 'Bank Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'sales_invoices', 'label' => 'Sales Invoices', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'purchase_invoices', 'label' => 'Purchase Invoices / Bills', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'petty_cash_records', 'label' => 'Petty Cash Records', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'credit_card_statements', 'label' => 'Credit Card Statements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'payroll_records', 'label' => 'Payroll / WPS Records', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'number_of_transactions', 'label' => 'Estimated Number of Transactions', 'type' => 'number', 'required' => false, 'placeholder' => '0', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Any special transactions or adjustments', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'updated_books', 'label' => 'Updated Books / Accounting File', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trial_balance', 'label' => 'Trial Balance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_reconciliation', 'label' => 'Bank Reconciliation Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'ar_aging', 'label' => 'Accounts Receivable Aging', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'ap_aging', 'label' => 'Accounts Payable Aging', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'vat_summary', 'label' => 'VAT Summary Report', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'transactions_processed', 'label' => 'Number of Transactions Processed', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes / Issues Found', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 31. Financial Statements Preparation
            // -----------------------------------------------------------------
            [
                'name' => 'Financial Statements Preparation',
                'description' => 'Preparation of annual financial statements in accordance with IFRS (International Financial Reporting Standards) as adopted in the UAE. Includes Statement of Financial Position, Statement of Profit or Loss, Statement of Changes in Equity, Statement of Cash Flows, and Notes to the Financial Statements.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_year', 'label' => 'Financial Year', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., 1 Jan 2025 - 31 Dec 2025', 'options' => []],
                    ['name' => 'reporting_framework', 'label' => 'Reporting Framework', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['IFRS (Full)', 'IFRS for SMEs', 'Other']],
                    ['name' => 'trial_balance', 'label' => 'Trial Balance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'general_ledger', 'label' => 'General Ledger', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_confirmations', 'label' => 'Bank Confirmation Letters', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'fixed_asset_register', 'label' => 'Fixed Asset Register', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'inventory_records', 'label' => 'Inventory Records / Stock Count', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'prior_year_financials', 'label' => 'Prior Year Financial Statements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'related_party_details', 'label' => 'Related Party Transaction Details', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'financial_statements', 'label' => 'Complete Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'management_report', 'label' => 'Management Report / Summary', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_revenue', 'label' => 'Total Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'net_profit_loss', 'label' => 'Net Profit / (Loss) (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_assets', 'label' => 'Total Assets (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 32. Management Accounts
            // -----------------------------------------------------------------
            [
                'name' => 'Management Accounts',
                'description' => 'Preparation of periodic management accounts and reports for internal decision-making. Includes profit & loss analysis, balance sheet, cash flow forecast, budget vs actual comparison, and key performance indicators tailored to the business.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'reporting_period', 'label' => 'Reporting Period', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'H1 2026', 'H2 2026']],
                    ['name' => 'report_type', 'label' => 'Report Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Monthly MIS', 'Quarterly Review', 'Half-Yearly Review', 'Budget vs Actual', 'Cash Flow Forecast', 'Custom Report']],
                    ['name' => 'accounting_data', 'label' => 'Accounting Data / Trial Balance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'budget_file', 'label' => 'Budget / Forecast File', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'specific_kpis', 'label' => 'Specific KPIs / Metrics Required', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Any specific metrics management wants to track', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'management_report', 'label' => 'Management Accounts Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'dashboard_summary', 'label' => 'Dashboard / Executive Summary', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'variance_analysis', 'label' => 'Variance Analysis Report', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes / Key Highlights', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 33. Accounting Software Setup
            // -----------------------------------------------------------------
            [
                'name' => 'Accounting Software Setup',
                'description' => 'Setup and configuration of cloud accounting software (Zoho Books, QuickBooks, Xero, etc.) including chart of accounts configuration, VAT settings, bank feeds, multi-currency setup, and staff training. Ensures FTA-compliant VAT accounting.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'software', 'label' => 'Accounting Software', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Zoho Books', 'QuickBooks Online', 'Xero', 'Tally Prime', 'Sage', 'FreshBooks', 'Other']],
                    ['name' => 'subscription_type', 'label' => 'Subscription Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['New Setup', 'Migration from Existing Software', 'Reconfiguration']],
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => false, 'placeholder' => 'For VAT configuration', 'options' => []],
                    ['name' => 'business_type', 'label' => 'Business Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Trading', 'Services', 'Manufacturing', 'Real Estate', 'Hospitality', 'Construction', 'Mixed']],
                    ['name' => 'number_of_users', 'label' => 'Number of Users', 'type' => 'number', 'required' => true, 'placeholder' => '1', 'options' => []],
                    ['name' => 'multi_currency', 'label' => 'Multi-Currency Required', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_details', 'label' => 'Bank Account Details for Integration', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Bank name, account number for bank feed setup', 'options' => []],
                    ['name' => 'existing_data', 'label' => 'Existing Accounting Data (for migration)', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'setup_confirmation', 'label' => 'Setup Confirmation / Screenshot', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'chart_of_accounts', 'label' => 'Chart of Accounts', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'login_credentials', 'label' => 'Login Details (Shared Securely)', 'type' => 'text', 'required' => true, 'placeholder' => 'Confirm credentials shared', 'options' => []],
                    ['name' => 'training_completed', 'label' => 'Staff Training Completed', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'training_notes', 'label' => 'Training Notes / Guide', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }

    // =========================================================================
    // AUDIT SERVICES
    // =========================================================================

    private function auditServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 34. External Audit (Statutory Audit)
            // -----------------------------------------------------------------
            [
                'name' => 'External Audit',
                'description' => 'Statutory / external audit of financial statements in accordance with International Standards on Auditing (ISA). Required by law for LLCs, free zone companies, and entities exceeding certain thresholds. Mandatory for Corporate Tax filing for qualifying businesses.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_year', 'label' => 'Financial Year', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., 1 Jan 2025 - 31 Dec 2025', 'options' => []],
                    ['name' => 'entity_type', 'label' => 'Entity Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['LLC', 'Free Zone Company', 'Branch', 'Partnership', 'Joint Stock', 'Other']],
                    ['name' => 'industry', 'label' => 'Industry / Sector', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Trading', 'Services', 'Manufacturing', 'Real Estate', 'Hospitality', 'Construction', 'Healthcare', 'Education', 'Technology', 'Financial Services', 'Transport & Logistics', 'Other']],
                    ['name' => 'estimated_revenue', 'label' => 'Estimated Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'estimated_total_assets', 'label' => 'Estimated Total Assets (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'number_of_employees', 'label' => 'Number of Employees', 'type' => 'number', 'required' => false, 'placeholder' => '0', 'options' => []],
                    ['name' => 'prior_year_audited_financials', 'label' => 'Prior Year Audited Financial Statements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'current_trial_balance', 'label' => 'Current Year Trial Balance', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'general_ledger', 'label' => 'General Ledger', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_statements', 'label' => 'Bank Statements (All Accounts)', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'bank_confirmations', 'label' => 'Bank Confirmation Letters', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'fixed_asset_register', 'label' => 'Fixed Asset Register', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_license_copy', 'label' => 'Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'moa_copy', 'label' => 'MOA / AOA Copy', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Any special areas of concern or focus', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'audit_report', 'label' => 'Signed Audit Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'audited_financials', 'label' => 'Audited Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'management_letter', 'label' => 'Management Letter', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'audit_opinion', 'label' => 'Audit Opinion', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Unqualified (Clean)', 'Qualified', 'Adverse', 'Disclaimer of Opinion']],
                    ['name' => 'total_revenue', 'label' => 'Audited Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'net_profit_loss', 'label' => 'Audited Net Profit / (Loss) (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'total_assets', 'label' => 'Audited Total Assets (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'report_date', 'label' => 'Report Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes / Key Findings', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 35. Internal Audit
            // -----------------------------------------------------------------
            [
                'name' => 'Internal Audit',
                'description' => 'Internal audit engagement to evaluate the effectiveness of internal controls, risk management, and governance processes. Covers operational, financial, and compliance auditing. Provides recommendations to strengthen controls and improve efficiency.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'audit_scope', 'label' => 'Audit Scope / Areas', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Full Internal Audit', 'Financial Controls', 'Operational Processes', 'IT Controls', 'Compliance', 'Procurement', 'HR & Payroll', 'Inventory Management', 'Revenue Cycle', 'Custom Scope']],
                    ['name' => 'audit_period', 'label' => 'Audit Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Jan-Dec 2025', 'options' => []],
                    ['name' => 'key_areas_of_concern', 'label' => 'Key Areas of Concern', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Specific processes or risks management wants reviewed', 'options' => []],
                    ['name' => 'previous_audit_report', 'label' => 'Previous Internal Audit Report', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'org_chart', 'label' => 'Organization Chart', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'policies_procedures', 'label' => 'Key Policies & Procedures', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'internal_audit_report', 'label' => 'Internal Audit Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'findings_summary', 'label' => 'Findings & Recommendations Summary', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'risk_rating', 'label' => 'Overall Risk Rating', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Low', 'Medium', 'High', 'Critical']],
                    ['name' => 'number_of_findings', 'label' => 'Number of Findings', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'management_action_plan', 'label' => 'Management Action Plan', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'report_date', 'label' => 'Report Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 36. Due Diligence
            // -----------------------------------------------------------------
            [
                'name' => 'Due Diligence',
                'description' => 'Financial and tax due diligence for mergers, acquisitions, investments, or business purchases. Includes review of financial statements, tax compliance, contracts, liabilities, and identification of risks and deal breakers.',
                'form_schema' => [
                    ['name' => 'target_entity_name', 'label' => 'Target Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'due_diligence_type', 'label' => 'Due Diligence Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Financial Due Diligence', 'Tax Due Diligence', 'Combined Financial & Tax', 'Commercial Due Diligence', 'Legal Due Diligence Support']],
                    ['name' => 'purpose', 'label' => 'Purpose', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Acquisition', 'Merger', 'Investment', 'Joint Venture', 'Business Purchase', 'Lending/Financing', 'Other']],
                    ['name' => 'review_period', 'label' => 'Review Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Last 3 financial years', 'options' => []],
                    ['name' => 'financial_statements', 'label' => 'Target Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_returns', 'label' => 'Target Tax Returns', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'key_contracts', 'label' => 'Key Contracts / Agreements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'specific_areas', 'label' => 'Specific Areas of Focus', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'timeline', 'label' => 'Expected Completion Timeline', 'type' => 'text', 'required' => false, 'placeholder' => 'e.g., 2 weeks', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'dd_report', 'label' => 'Due Diligence Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'executive_summary', 'label' => 'Executive Summary', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'red_flags', 'label' => 'Red Flags / Deal Breakers Identified', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'risk_assessment', 'label' => 'Risk Assessment', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Low Risk', 'Medium Risk', 'High Risk', 'Deal Breakers Identified']],
                    ['name' => 'report_date', 'label' => 'Report Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 37. Agreed-Upon Procedures (AUP)
            // -----------------------------------------------------------------
            [
                'name' => 'Agreed-Upon Procedures',
                'description' => 'Engagement to perform specific procedures agreed upon by the client and report factual findings. Common for free zone annual reporting requirements, specific compliance verifications, grant certifications, and bank covenant compliance.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'purpose', 'label' => 'Purpose of AUP', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Free Zone Annual Report', 'Bank Covenant Compliance', 'Grant / Subsidy Verification', 'Specific Transaction Review', 'Regulatory Requirement', 'Other']],
                    ['name' => 'period', 'label' => 'Period Covered', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'procedures_scope', 'label' => 'Agreed Procedures / Scope of Work', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe the specific procedures to be performed', 'options' => []],
                    ['name' => 'supporting_documents', 'label' => 'Supporting Documents', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'intended_users', 'label' => 'Intended Users of the Report', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Bank, Free Zone Authority, Management', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'aup_report', 'label' => 'AUP Factual Findings Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'report_date', 'label' => 'Report Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }

    // =========================================================================
    // ADVISORY SERVICES
    // =========================================================================

    private function advisoryServices(): array
    {
        return [

            // -----------------------------------------------------------------
            // 38. Tax Planning & Structuring
            // -----------------------------------------------------------------
            [
                'name' => 'Tax Planning & Structuring',
                'description' => 'Advisory service for tax-efficient structuring of business operations, investments, and transactions under the UAE Corporate Tax regime. Includes analysis of free zone qualifying income eligibility, small business relief applicability, group restructuring, and holding structure optimization.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity / Group Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'advisory_scope', 'label' => 'Advisory Scope', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Corporate Tax Planning', 'Free Zone Structuring', 'Group Restructuring', 'Investment Structuring', 'New Business Setup Advisory', 'Holding Company Structure', 'Cross-Border Tax Planning', 'VAT Planning']],
                    ['name' => 'current_structure', 'label' => 'Current Business / Group Structure', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe current entity structure, jurisdictions, intercompany flows', 'options' => []],
                    ['name' => 'business_objective', 'label' => 'Business Objective / What You Want to Achieve', 'type' => 'textarea', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'estimated_annual_revenue', 'label' => 'Estimated Annual Revenue (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'trade_licenses', 'label' => 'Trade Licenses of All Entities', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_statements', 'label' => 'Latest Financial Statements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'group_structure_chart', 'label' => 'Group Structure Chart', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'advisory_report', 'label' => 'Tax Advisory Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'proposed_structure', 'label' => 'Proposed Structure Diagram', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_impact_analysis', 'label' => 'Tax Impact Analysis', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'estimated_tax_saving', 'label' => 'Estimated Annual Tax Saving (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'implementation_steps', 'label' => 'Implementation Steps / Action Plan', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'delivery_date', 'label' => 'Delivery Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 39. Transfer Pricing
            // -----------------------------------------------------------------
            [
                'name' => 'Transfer Pricing',
                'description' => 'Transfer pricing advisory, documentation, and compliance services under UAE Corporate Tax Law. Includes preparation of Master File, Local File, and supporting documentation for related party and connected person transactions. Ensures arm\'s length pricing in compliance with OECD guidelines.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'ct_trn', 'label' => 'Corporate Tax TRN', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'service_type', 'label' => 'Service Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Transfer Pricing Documentation (Master File + Local File)', 'Master File Only', 'Local File Only', 'TP Policy Development', 'Benchmarking Study', 'TP Advisory / Review', 'Advance Pricing Agreement (APA) Support']],
                    ['name' => 'financial_year', 'label' => 'Financial Year', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_revenue', 'label' => 'Total Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'related_party_details', 'label' => 'Related Party / Connected Person Details', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Name, jurisdiction, relationship, type of transactions', 'options' => []],
                    ['name' => 'total_rpt_value', 'label' => 'Total Related Party Transaction Value (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'transaction_types', 'label' => 'Types of Related Party Transactions', 'type' => 'textarea', 'required' => true, 'placeholder' => 'e.g., Sale of goods, management fees, IP royalties, loans', 'options' => []],
                    ['name' => 'financial_statements', 'label' => 'Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'intercompany_agreements', 'label' => 'Intercompany Agreements', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'tp_documentation', 'label' => 'Transfer Pricing Documentation', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'master_file', 'label' => 'Master File', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'local_file', 'label' => 'Local File', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'benchmarking_report', 'label' => 'Benchmarking Study Report', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'tp_policy', 'label' => 'Transfer Pricing Policy', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'delivery_date', 'label' => 'Delivery Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 40. Free Zone Qualifying Income Assessment
            // -----------------------------------------------------------------
            [
                'name' => 'Free Zone Tax Assessment',
                'description' => 'Assessment of whether a free zone entity qualifies as a Qualifying Free Zone Person (QFZP) under the UAE Corporate Tax Law and Ministerial Decision No. 139 of 2023. Evaluates qualifying income, de minimis threshold, adequate substance, and compliance with arm\'s length and TP documentation requirements.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'free_zone', 'label' => 'Free Zone', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'license_number', 'label' => 'License Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_year', 'label' => 'Financial Year', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'total_revenue', 'label' => 'Total Revenue (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'revenue_from_qualifying_activities', 'label' => 'Revenue from Qualifying Activities (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'revenue_from_mainland', 'label' => 'Revenue from Mainland UAE Entities (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'has_mainland_pe', 'label' => 'Has Permanent Establishment on Mainland', 'type' => 'checkbox', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'business_activities', 'label' => 'Business Activities Conducted', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Describe all business activities', 'options' => []],
                    ['name' => 'number_of_employees', 'label' => 'Number of Qualified Employees', 'type' => 'number', 'required' => true, 'placeholder' => '0', 'options' => []],
                    ['name' => 'financial_statements', 'label' => 'Financial Statements', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trade_license', 'label' => 'Trade License Copy', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'assessment_report', 'label' => 'QFZP Assessment Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'qualifies_as_qfzp', 'label' => 'Qualifies as QFZP', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['Yes - Fully Qualifies', 'Partially (Exceeds De Minimis)', 'No - Does Not Qualify', 'Requires Restructuring']],
                    ['name' => 'qualifying_income_amount', 'label' => 'Qualifying Income (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'taxable_income_amount', 'label' => 'Taxable Income at 9% (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'recommendations', 'label' => 'Recommendations', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'delivery_date', 'label' => 'Delivery Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 41. FTA Tax Audit Support
            // -----------------------------------------------------------------
            [
                'name' => 'FTA Tax Audit Support',
                'description' => 'Representation and support during FTA tax audits. Includes preparation of audit-ready documentation, responding to FTA queries, attending meetings with FTA auditors, and managing the audit process to ensure the best possible outcome for the client.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'trn_number', 'label' => 'TRN Number', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'audit_type', 'label' => 'Audit Type', 'type' => 'dropdown', 'required' => true, 'placeholder' => '', 'options' => ['VAT Audit', 'Corporate Tax Audit', 'Excise Tax Audit', 'Combined Audit']],
                    ['name' => 'audit_notification', 'label' => 'FTA Audit Notification Letter', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'audit_period', 'label' => 'Audit Period', 'type' => 'text', 'required' => true, 'placeholder' => 'e.g., Jan 2024 - Dec 2025', 'options' => []],
                    ['name' => 'fta_queries', 'label' => 'FTA Information Request / Queries', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'tax_returns_filed', 'label' => 'Tax Returns for Audit Period', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'financial_records', 'label' => 'Financial Records / Ledgers', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'response_deadline', 'label' => 'FTA Response Deadline', 'type' => 'date', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'audit_response', 'label' => 'Response Submitted to FTA', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'fta_audit_result', 'label' => 'FTA Audit Result', 'type' => 'dropdown', 'required' => false, 'placeholder' => '', 'options' => ['No Adjustment', 'Minor Adjustment', 'Significant Adjustment', 'Penalty Imposed', 'Ongoing']],
                    ['name' => 'assessment_amount', 'label' => 'Additional Tax Assessment (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'penalty_amount', 'label' => 'Penalty Amount (AED)', 'type' => 'number', 'required' => false, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'fta_final_letter', 'label' => 'FTA Final Assessment / Closure Letter', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_date', 'label' => 'Completion Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],

            // -----------------------------------------------------------------
            // 42. Withholding Tax Advisory
            // -----------------------------------------------------------------
            [
                'name' => 'Withholding Tax Advisory',
                'description' => 'Advisory on UAE Withholding Tax obligations (currently 0% rate but applicable on certain payments to non-residents as per the CT Law). Includes analysis of cross-border payments, DTAA applicability, and documentation requirements.',
                'form_schema' => [
                    ['name' => 'entity_name', 'label' => 'Entity Name', 'type' => 'text', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'payment_types', 'label' => 'Types of Cross-Border Payments', 'type' => 'textarea', 'required' => true, 'placeholder' => 'e.g., Royalties, dividends, interest, management fees, service fees', 'options' => []],
                    ['name' => 'recipient_jurisdictions', 'label' => 'Recipient Jurisdictions', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Countries where payments are made to', 'options' => []],
                    ['name' => 'estimated_annual_payments', 'label' => 'Estimated Annual Cross-Border Payments (AED)', 'type' => 'number', 'required' => true, 'placeholder' => '0.00', 'options' => []],
                    ['name' => 'existing_agreements', 'label' => 'Existing Agreements with Foreign Parties', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'completion_schema' => [
                    ['name' => 'advisory_report', 'label' => 'WHT Advisory Report', 'type' => 'file', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'dtaa_analysis', 'label' => 'DTAA Analysis / Summary', 'type' => 'file', 'required' => false, 'placeholder' => '', 'options' => []],
                    ['name' => 'delivery_date', 'label' => 'Delivery Date', 'type' => 'date', 'required' => true, 'placeholder' => '', 'options' => []],
                    ['name' => 'completion_notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false, 'placeholder' => '', 'options' => []],
                ],
                'is_active' => true,
            ],
        ];
    }
}
