<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Service;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskQuery;
use App\Models\TaskQueryResponse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // Resolve users by email so seeder works regardless of auto-increment IDs
        $admin = User::where('email', 'admin@icbcrm.com')->first();
        $rashid = User::where('email', 'rashid@icbcrm.com')->first();
        $sarah = User::where('email', 'sarah@icbcrm.com')->first();
        $mohammed = User::where('email', 'mohammed@icbcrm.com')->first();
        $fatima = User::where('email', 'fatima@icbcrm.com')->first();
        $omar = User::where('email', 'omar@icbcrm.com')->first();
        $aisha = User::where('email', 'aisha@icbcrm.com')->first();
        $yusuf = User::where('email', 'yusuf@icbcrm.com')->first();
        $priya = User::where('email', 'priya@icbcrm.com')->first();
        $khalid = User::where('email', 'khalid@icbcrm.com')->first();

        $services = Service::pluck('id', 'name');
        $clients = Client::with('user')->get()->keyBy(fn ($c) => $c->user->email);

        $alMaktoum = $clients['info@almaktoumtrading.ae'];
        $gulfStar = $clients['accounts@gulfstar.ae'];
        $emiratesTech = $clients['finance@emiratestech.ae'];
        $falcon = $clients['ops@falconlogistics.ae'];
        $oasis = $clients['admin@oasishospitality.ae'];
        $zenith = $clients['info@zenithre.ae'];
        $pearl = $clients['accounts@pearlmarine.ae'];
        $burj = $clients['finance@burjcontracting.ae'];
        $noor = $clients['admin@noormedical.ae'];
        $sands = $clients['info@sandsfb.ae'];

        $now = Carbon::now();

        // =================================================================
        // COMPLETED TASKS — realistic finished work
        // =================================================================

        // 1. VAT Registration for Al Maktoum Trading — completed successfully
        $t1 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['VAT Registration'],
            'client_id' => $alMaktoum->id,
            'responsible_id' => $sarah->id,
            'priority' => 'high',
            'status' => 'completed',
            'due_date' => $now->copy()->subDays(12),
            'instructions' => "Client is a trading company with annual turnover exceeding AED 500,000. Mandatory VAT registration required.\n\nAll KYC documents have been collected. TRN application to be submitted via EmaraTax portal.",
            'created_at' => $now->copy()->subDays(25),
            'updated_at' => $now->copy()->subDays(14),
        ]);
        TaskComment::create(['task_id' => $t1->id, 'user_id' => $sarah->id, 'body' => 'Reviewed all documents. Trade license, MOA, and Emirates ID are in order. Submitting application on EmaraTax today.', 'created_at' => $now->copy()->subDays(23)]);
        TaskComment::create(['task_id' => $t1->id, 'user_id' => $sarah->id, 'body' => 'Application submitted. FTA reference number: VAT-REG-2026-04521. Expected processing time is 3-5 business days.', 'created_at' => $now->copy()->subDays(21)]);
        TaskComment::create(['task_id' => $t1->id, 'user_id' => $admin->id, 'body' => 'Good. Please share the TRN certificate with the client once received.', 'created_at' => $now->copy()->subDays(20)]);
        TaskComment::create(['task_id' => $t1->id, 'user_id' => $sarah->id, 'body' => 'TRN issued: 100xxxxxxxxx15. Certificate downloaded and shared with the client via email. First VAT return period starts April 2026.', 'created_at' => $now->copy()->subDays(14)]);

        // 2. Trade License Renewal for Gulf Star — completed
        $t2 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Trade License Renewal'],
            'client_id' => $gulfStar->id,
            'responsible_id' => $fatima->id,
            'priority' => 'medium',
            'status' => 'completed',
            'due_date' => $now->copy()->subDays(5),
            'instructions' => "Annual trade license renewal for Gulf Star Enterprises. Current license expires on March 20, 2026.\n\nClient has confirmed no changes to activities or shareholders. Straightforward renewal.",
            'created_at' => $now->copy()->subDays(20),
            'updated_at' => $now->copy()->subDays(7),
        ]);
        $t2->collaborators()->attach($priya->id, ['can_work' => true]);
        TaskComment::create(['task_id' => $t2->id, 'user_id' => $fatima->id, 'body' => 'Checked with Abu Dhabi DED portal. Renewal fees: AED 12,300 (license fee + Tasheel charges). No outstanding violations.', 'created_at' => $now->copy()->subDays(18)]);
        TaskComment::create(['task_id' => $t2->id, 'user_id' => $priya->id, 'body' => 'Submitted renewal application on Tasheel. Payment processed. Waiting for approval — usually takes 1-2 business days.', 'created_at' => $now->copy()->subDays(10)]);
        TaskComment::create(['task_id' => $t2->id, 'user_id' => $fatima->id, 'body' => 'Renewed license received. New expiry: March 20, 2027. Soft copy sent to client.', 'created_at' => $now->copy()->subDays(7)]);

        // 3. External Audit for Emirates Tech — completed
        $t3 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['External Audit'],
            'client_id' => $emiratesTech->id,
            'responsible_id' => $mohammed->id,
            'priority' => 'high',
            'status' => 'completed',
            'due_date' => $now->copy()->subDays(3),
            'instructions' => "Statutory audit for FY 2025. Required by SAIF Zone authority for license renewal.\n\nClient is an electronics trading company. Revenue approx AED 8.2M. IFRS-compliant statements needed.",
            'created_at' => $now->copy()->subDays(30),
            'updated_at' => $now->copy()->subDays(4),
        ]);
        $t3->collaborators()->attach($khalid->id, ['can_work' => true]);
        $t3->collaborators()->attach($aisha->id, ['can_work' => false]);
        TaskComment::create(['task_id' => $t3->id, 'user_id' => $mohammed->id, 'body' => 'Received trial balance and bank statements for FY 2025. Starting fieldwork next week.', 'created_at' => $now->copy()->subDays(25)]);
        TaskComment::create(['task_id' => $t3->id, 'user_id' => $khalid->id, 'body' => 'Completed inventory verification and accounts receivable confirmation. Two minor discrepancies found in trade payables — discussed with client.', 'created_at' => $now->copy()->subDays(15)]);
        TaskComment::create(['task_id' => $t3->id, 'user_id' => $mohammed->id, 'body' => 'Audit report finalized with unqualified opinion. Management letter issued highlighting 3 recommendations. Report signed and sealed.', 'created_at' => $now->copy()->subDays(4)]);

        // 4. Bookkeeping for Sands F&B — completed monthly
        $t4 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Bookkeeping'],
            'client_id' => $sands->id,
            'responsible_id' => $aisha->id,
            'priority' => 'medium',
            'status' => 'completed',
            'due_date' => $now->copy()->subDays(2),
            'instructions' => "Monthly bookkeeping for February 2026. Client uses Zoho Books.\n\nExpect ~120 transactions. Petty cash reconciliation needed. Ensure VAT codes are correctly applied.",
            'created_at' => $now->copy()->subDays(10),
            'updated_at' => $now->copy()->subDays(3),
        ]);
        TaskComment::create(['task_id' => $t4->id, 'user_id' => $aisha->id, 'body' => 'Bank statement received. 118 transactions recorded. Petty cash reconciled — AED 45 variance identified and adjusted.', 'created_at' => $now->copy()->subDays(5)]);
        TaskComment::create(['task_id' => $t4->id, 'user_id' => $aisha->id, 'body' => 'All entries posted. VAT input/output matched. Monthly P&L and balance sheet shared with client on Zoho.', 'created_at' => $now->copy()->subDays(3)]);

        // 5. Corporate Tax Registration for Falcon — completed
        $t5 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['Corporate Tax Registration'],
            'client_id' => $falcon->id,
            'responsible_id' => $yusuf->id,
            'priority' => 'high',
            'status' => 'completed',
            'due_date' => $now->copy()->subDays(8),
            'instructions' => "Corporate Tax registration on EmaraTax. Client's first tax period starts January 2026.\n\nFalcon Logistics is a mainland LLC in JAFZA. Confirm if they qualify for any small business relief (revenue < AED 3M).",
            'created_at' => $now->copy()->subDays(22),
            'updated_at' => $now->copy()->subDays(9),
        ]);
        $t5->collaborators()->attach($sarah->id, ['can_work' => false]);
        TaskComment::create(['task_id' => $t5->id, 'user_id' => $yusuf->id, 'body' => 'Checked client financials — FY2025 revenue was AED 4.7M so small business relief does NOT apply. Standard 9% CT rate applicable.', 'created_at' => $now->copy()->subDays(20)]);
        TaskComment::create(['task_id' => $t5->id, 'user_id' => $yusuf->id, 'body' => 'CT registration submitted on EmaraTax. Corporate Tax Registration Number issued. First CT return due September 30, 2027 (9 months from FY end Dec 2026).', 'created_at' => $now->copy()->subDays(9)]);

        // =================================================================
        // IN-PROGRESS TASKS — active work
        // =================================================================

        // 6. VAT Return Filing Q1 2026 for Al Maktoum — in progress
        $t6 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['VAT Return Filing'],
            'client_id' => $alMaktoum->id,
            'responsible_id' => $omar->id,
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(5),
            'instructions' => "Q1 2026 VAT return (Jan-Mar). Filing deadline: April 28, 2026.\n\nClient TRN: 100xxxxxxxxx15. Sales invoices and purchase records should be collected from Zoho Books. Ensure all zero-rated exports are properly documented.",
            'created_at' => $now->copy()->subDays(7),
        ]);
        $t6->collaborators()->attach($sarah->id, ['can_work' => true]);
        $t6->collaborators()->attach($aisha->id, ['can_work' => false]);
        TaskComment::create(['task_id' => $t6->id, 'user_id' => $omar->id, 'body' => 'Received Zoho Books access. Extracting sales and purchase registers for Q1.', 'created_at' => $now->copy()->subDays(5)]);
        TaskComment::create(['task_id' => $t6->id, 'user_id' => $omar->id, 'body' => 'VAT computation draft ready. Total output VAT: AED 47,250. Input VAT: AED 31,800. Net payable: AED 15,450. Reviewing zero-rated supplies now.', 'created_at' => $now->copy()->subDays(2)]);
        // Query on this task
        $q1 = TaskQuery::create([
            'task_id' => $t6->id,
            'raised_by' => $omar->id,
            'directed_to' => $admin->id,
            'subject' => 'Clarification on export invoice #INV-2026-0087',
            'description' => "Invoice #INV-2026-0087 dated Feb 15, 2026 for AED 125,000 is marked as a local sale but the shipping documents show delivery to Oman. Should this be treated as zero-rated export?\n\nIf yes, we need the client to provide the customs declaration and proof of export.",
            'priority' => 'urgent',
            'status' => 'answered',
            'created_at' => $now->copy()->subDays(3),
        ]);
        TaskQueryResponse::create(['query_id' => $q1->id, 'user_id' => $admin->id, 'body' => "Yes, reclassify it as zero-rated export under Article 30 of the VAT Decree-Law. Ask the client for:\n1. Customs export declaration\n2. Bill of lading / airway bill\n3. Proof of receipt in Oman\n\nWithout these documents we cannot apply zero-rating and it must remain as standard-rated 5%.", 'created_at' => $now->copy()->subDays(2)]);
        TaskQueryResponse::create(['query_id' => $q1->id, 'user_id' => $omar->id, 'body' => 'Thanks. I have requested the documents from the client. They confirmed they have the customs declaration and will share by tomorrow.', 'created_at' => $now->copy()->subDays(1)]);

        // 7. ESR Notification for Zenith Real Estate — in progress
        $t7 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['ESR Notification Filing'],
            'client_id' => $zenith->id,
            'responsible_id' => $yusuf->id,
            'priority' => 'medium',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(15),
            'instructions' => "ESR Notification for FY 2025. Zenith Real Estate is a DMCC company engaged in holding company and real estate activities.\n\nDetermine if they carry on a Relevant Activity under the ESR regulations. If yes, file the ESR Notification on the Ministry of Economy portal.",
            'created_at' => $now->copy()->subDays(5),
        ]);
        TaskComment::create(['task_id' => $t7->id, 'user_id' => $yusuf->id, 'body' => "Reviewed Zenith's activities. They hold shares in 2 subsidiaries and earn rental income from 3 properties. Both 'Holding Company' and 'Lease-Finance' are Relevant Activities. ESR Notification required.", 'created_at' => $now->copy()->subDays(3)]);

        // 8. Company Formation Mainland for new client referral — in progress
        $t8 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Company Formation - Mainland'],
            'client_id' => $burj->id,
            'responsible_id' => $fatima->id,
            'priority' => 'medium',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(20),
            'instructions' => "Burj Contracting wants to set up a new subsidiary LLC in Dubai for their MEP division.\n\nProposed name: Burj MEP Solutions LLC\nActivities: Mechanical, Electrical & Plumbing contracting\nShareholders: Burj Contracting (100%)\nRequires initial approval from DED Dubai + DEWA NOC for MEP activities.",
            'created_at' => $now->copy()->subDays(8),
        ]);
        $t8->collaborators()->attach($priya->id, ['can_work' => true]);
        TaskComment::create(['task_id' => $t8->id, 'user_id' => $fatima->id, 'body' => 'Initial name reservation submitted on DED Dubai portal. "Burj MEP Solutions LLC" — awaiting approval (2-3 business days).', 'created_at' => $now->copy()->subDays(6)]);
        TaskComment::create(['task_id' => $t8->id, 'user_id' => $priya->id, 'body' => 'Name approved. Now preparing MOA draft and collecting shareholder documents for DED submission.', 'created_at' => $now->copy()->subDays(3)]);
        // Query on this task
        $q2 = TaskQuery::create([
            'task_id' => $t8->id,
            'raised_by' => $fatima->id,
            'directed_to' => $rashid->id,
            'subject' => 'DEWA NOC requirement for MEP activity',
            'description' => "DED is asking for a DEWA NOC as a prerequisite for issuing the MEP contracting license. Client says they have never obtained this before.\n\nCan you confirm the process? Do we need to apply through DEWA directly or through Tasheel?",
            'priority' => 'normal',
            'status' => 'open',
            'created_at' => $now->copy()->subDays(2),
        ]);
        TaskQueryResponse::create(['query_id' => $q2->id, 'user_id' => $rashid->id, 'body' => "DEWA NOC must be applied directly through DEWA's contractor licensing portal. The client needs:\n1. Trade license copy of parent company\n2. DEWA contractor classification certificate (if they have one from Abu Dhabi, it helps)\n3. Engineering qualifications of the technical manager\n\nProcessing takes about 5-7 working days. Priya can coordinate the DEWA visit.", 'created_at' => $now->copy()->subDays(1)]);

        // 9. FTA Penalty Reconsideration for Oasis Hospitality — in progress, urgent
        $t9 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['FTA Penalty Reconsideration'],
            'client_id' => $oasis->id,
            'responsible_id' => $sarah->id,
            'priority' => 'urgent',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(8),
            'instructions' => "Client received a penalty of AED 50,000 from FTA for late VAT return filing (Q4 2025). They claim they filed on time but the portal showed an error.\n\nDeadline for reconsideration: 40 business days from penalty notification (notified Feb 20, 2026).\n\nGather evidence: portal screenshots, email confirmations, FTA communication logs.",
            'created_at' => $now->copy()->subDays(10),
        ]);
        $t9->collaborators()->attach($omar->id, ['can_work' => true]);
        TaskComment::create(['task_id' => $t9->id, 'user_id' => $sarah->id, 'body' => "Collected client's evidence:\n1. Screenshot of EmaraTax showing submission attempt on Dec 27, 2025 (before deadline)\n2. Error message screenshot (portal timeout)\n3. Email to FTA helpdesk on Dec 28 reporting the issue\n\nPreparing the reconsideration letter now.", 'created_at' => $now->copy()->subDays(7)]);
        TaskComment::create(['task_id' => $t9->id, 'user_id' => $omar->id, 'body' => 'I found FTA Decision No. 4 of 2024 which allows waiver of administrative penalties where the registrant can demonstrate technical issues with the FTA portal. This strengthens our case.', 'created_at' => $now->copy()->subDays(5)]);
        TaskComment::create(['task_id' => $t9->id, 'user_id' => $sarah->id, 'body' => 'Reconsideration application submitted via EmaraTax on Form TAX 901. Reference: RECON-2026-00891. Now waiting for FTA response (usually 40 business days).', 'created_at' => $now->copy()->subDays(3)]);
        // Query
        $q3 = TaskQuery::create([
            'task_id' => $t9->id,
            'raised_by' => $sarah->id,
            'directed_to' => $admin->id,
            'subject' => 'Should we also file for TDRC appeal?',
            'description' => "The FTA reconsideration has been submitted, but if it's rejected, the client can escalate to the Tax Disputes Resolution Committee (TDRC) within 20 business days.\n\nShould we proactively prepare the TDRC appeal documents now, or wait for the FTA decision first? The TDRC filing fee is AED 750.",
            'priority' => 'normal',
            'status' => 'answered',
            'created_at' => $now->copy()->subDays(2),
        ]);
        TaskQueryResponse::create(['query_id' => $q3->id, 'user_id' => $admin->id, 'body' => "Wait for the FTA decision first. No need to prepare TDRC documents prematurely — it will add unnecessary cost for the client. However, do note the TDRC deadline in your calendar so we don't miss it if the reconsideration is rejected.\n\nAlso inform the client about the possible next steps so they're not surprised.", 'created_at' => $now->copy()->subDays(1)]);

        // 10. Transfer Pricing for Gulf Star — in progress
        $t10 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['Transfer Pricing'],
            'client_id' => $gulfStar->id,
            'responsible_id' => $yusuf->id,
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(25),
            'instructions' => "Prepare Transfer Pricing documentation (Local File) for FY 2025. Gulf Star has related party transactions with their parent company in India.\n\nKey transactions:\n- Management fees paid to parent: AED 1.2M\n- Purchase of goods from related entity: AED 3.8M\n- Royalty payments: AED 450K\n\nBenchmarking study required using TNMM method.",
            'created_at' => $now->copy()->subDays(12),
        ]);
        $t10->collaborators()->attach($sarah->id, ['can_work' => true]);
        TaskComment::create(['task_id' => $t10->id, 'user_id' => $yusuf->id, 'body' => 'Received intercompany agreements and financial data. Starting functional analysis and benchmarking using Bureau van Dijk (Orbis) database.', 'created_at' => $now->copy()->subDays(8)]);
        // Query
        $q4 = TaskQuery::create([
            'task_id' => $t10->id,
            'raised_by' => $yusuf->id,
            'directed_to' => $sarah->id,
            'subject' => 'Management fee benchmarking — comparable range',
            'description' => "The TNMM benchmarking for management fees shows an arm's length range of 3-7% of revenue. Gulf Star's management fee (AED 1.2M) represents 4.8% of their revenue, which falls within range.\n\nHowever, the Indian parent has a different calculation methodology (cost-plus 15%). Should we document both approaches or just the TNMM result?",
            'priority' => 'normal',
            'status' => 'open',
            'created_at' => $now->copy()->subDays(4),
        ]);

        // 11. Financial Statements for Pearl Marine — in progress
        $t11 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Financial Statements Preparation'],
            'client_id' => $pearl->id,
            'responsible_id' => $aisha->id,
            'priority' => 'medium',
            'status' => 'in_progress',
            'due_date' => $now->copy()->addDays(18),
            'instructions' => "Prepare IFRS-compliant financial statements for FY 2025. Required for Hamriyah Free Zone license renewal and bank facility renewal with Emirates NBD.\n\nClient has been using our bookkeeping service, so Zoho Books data is up to date.",
            'created_at' => $now->copy()->subDays(6),
        ]);
        $t11->collaborators()->attach($mohammed->id, ['can_work' => false]);
        TaskComment::create(['task_id' => $t11->id, 'user_id' => $aisha->id, 'body' => 'Exported Zoho Books trial balance. Working on IFRS adjustments: IFRS 16 lease accounting for 2 office leases and IFRS 9 expected credit loss provision.', 'created_at' => $now->copy()->subDays(3)]);

        // =================================================================
        // IN-PROGRESS — OVERDUE TASKS
        // =================================================================

        // 12. Voluntary Disclosure for Falcon Logistics — overdue
        $t12 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Voluntary Disclosure'],
            'client_id' => $falcon->id,
            'responsible_id' => $omar->id,
            'priority' => 'urgent',
            'status' => 'in_progress',
            'due_date' => $now->copy()->subDays(3),
            'instructions' => "Client discovered an error in Q3 2025 VAT return — input VAT of AED 28,000 was claimed on an entertainment expense (non-recoverable). Net tax impact: AED 28,000 + potential penalties.\n\nVoluntary Disclosure must be filed before FTA discovers the error. Use Form VAT 211.",
            'created_at' => $now->copy()->subDays(14),
        ]);
        TaskComment::create(['task_id' => $t12->id, 'user_id' => $omar->id, 'body' => 'Recalculated Q3 2025 return. The AED 28,000 input VAT on entertainment must be reversed. Preparing the Voluntary Disclosure form.', 'created_at' => $now->copy()->subDays(10)]);
        TaskComment::create(['task_id' => $t12->id, 'user_id' => $omar->id, 'body' => 'Form VAT 211 drafted. Need admin approval before submission. The client will also need to pay the additional AED 28,000 VAT plus any late payment penalty.', 'created_at' => $now->copy()->subDays(5)]);
        // Query
        $q5 = TaskQuery::create([
            'task_id' => $t12->id,
            'raised_by' => $omar->id,
            'directed_to' => $admin->id,
            'subject' => 'Should we disclose the penalty calculation to client?',
            'description' => "The Voluntary Disclosure will trigger an automatic fixed penalty of AED 3,000 (first offence) under Cabinet Decision 49/2021, plus a variable penalty of 1% per month on the AED 28,000 from the original due date.\n\nEstimated total: AED 28,000 (tax) + AED 3,000 (fixed) + AED 1,680 (variable, 6 months) = AED 32,680.\n\nShould I share this breakdown with the client before filing?",
            'priority' => 'urgent',
            'status' => 'open',
            'created_at' => $now->copy()->subDays(4),
        ]);

        // 13. Employment Visa for Noor Medical — overdue
        $t13 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Employment Visa Processing'],
            'client_id' => $noor->id,
            'responsible_id' => $priya->id,
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => $now->copy()->subDays(5),
            'instructions' => "Employment visa for Dr. Arun Patel (Indian national, Specialist Physician). Entry permit approved, medical fitness test completed.\n\nPending: Emirates ID application and visa stamping. MOHRE work permit already issued.",
            'created_at' => $now->copy()->subDays(18),
        ]);
        TaskComment::create(['task_id' => $t13->id, 'user_id' => $priya->id, 'body' => 'Entry permit issued. Dr. Patel has entered the UAE. Medical fitness test completed at DHA-approved center — result: Fit.', 'created_at' => $now->copy()->subDays(12)]);
        TaskComment::create(['task_id' => $t13->id, 'user_id' => $priya->id, 'body' => 'Emirates ID application submitted at ICA typing center. Biometrics done. Card expected in 5-7 working days.', 'created_at' => $now->copy()->subDays(8)]);
        TaskComment::create(['task_id' => $t13->id, 'user_id' => $priya->id, 'body' => 'Emirates ID received. Now scheduling GDRFA appointment for residence visa stamping. Earliest available slot is in 3 days.', 'created_at' => $now->copy()->subDays(4)]);

        // =================================================================
        // PENDING TASKS — queued work
        // =================================================================

        // 14. Corporate Tax Return for Emirates Tech — pending
        $t14 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['Corporate Tax Return Filing'],
            'client_id' => $emiratesTech->id,
            'responsible_id' => $yusuf->id,
            'priority' => 'high',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(30),
            'instructions' => "First Corporate Tax return for Emirates Tech Solutions FZE (FY ending Dec 2025). As a free zone company, assess Qualifying Free Zone Person (QFZP) eligibility.\n\nIf QFZP: 0% on qualifying income, 9% on non-qualifying income.\nAudit report (completed — Task #" . $t3->id . ") will be needed for the CT return.",
            'created_at' => $now->copy()->subDays(2),
        ]);
        $t14->collaborators()->attach($sarah->id, ['can_work' => true]);

        // 15. VAT Return Q1 for Zenith Real Estate — pending
        $t15 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['VAT Return Filing'],
            'client_id' => $zenith->id,
            'responsible_id' => $omar->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(12),
            'instructions' => "Q1 2026 VAT return filing. Zenith has both exempt (residential rental) and taxable (commercial rental) supplies. Input VAT apportionment required.\n\nEnsure the Capital Assets Scheme is applied for the Jumeirah Bay X2 office purchase (AED 2.3M, purchased Nov 2025).",
            'created_at' => $now->copy()->subDays(1),
        ]);

        // 16. Golden Visa for client director — pending
        $t16 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Golden Visa Application'],
            'client_id' => $alMaktoum->id,
            'responsible_id' => $priya->id,
            'priority' => 'low',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(40),
            'instructions' => "Golden Visa (10-year) application for Mr. Ahmed Al Maktoum, Managing Director of Al Maktoum Trading LLC.\n\nEligibility route: Investor — company has paid-up capital exceeding AED 2M.\n\nDocuments needed: passport, Emirates ID, trade license, audited financials showing capital, title deed (if property investor route is also applicable).",
            'created_at' => $now->copy(),
        ]);

        // 17. AML Compliance Setup for Sands F&B — pending
        $t17 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['AML Compliance Setup'],
            'client_id' => $sands->id,
            'responsible_id' => $fatima->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(35),
            'instructions' => "Set up AML/CFT compliance framework for Sands F&B Management FZCO. As a DNFBP (Designated Non-Financial Business), they need:\n\n1. AML policy manual\n2. Risk assessment matrix\n3. KYC/CDD procedures\n4. goAML registration\n5. Compliance officer appointment letter\n6. Staff training program",
            'created_at' => $now->copy(),
        ]);

        // 18. Internal Audit for Burj Contracting — pending
        $t18 = Task::create([
            'created_by' => $rashid->id,
            'service_id' => $services['Internal Audit'],
            'client_id' => $burj->id,
            'responsible_id' => $khalid->id,
            'priority' => 'low',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(45),
            'instructions' => "Annual internal audit of procurement and project cost controls. Focus areas:\n\n1. Subcontractor payment approvals\n2. Material procurement (cement, steel) — verify competitive bidding\n3. Project cost overruns (3 projects exceeded budget in 2025)\n4. Petty cash controls at project sites\n\nReport to be presented to the Board.",
            'created_at' => $now->copy(),
        ]);
        $t18->collaborators()->attach($mohammed->id, ['can_work' => true]);

        // 19. Bookkeeping March 2026 for Sands F&B — pending (follow-up from completed task)
        $t19 = Task::create([
            'parent_task_id' => $t4->id,
            'created_by' => $admin->id,
            'service_id' => $services['Bookkeeping'],
            'client_id' => $sands->id,
            'responsible_id' => $aisha->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(10),
            'instructions' => "Monthly bookkeeping for March 2026. Follow-up from Task #{$t4->id} (Feb 2026).\n\nNote: Client is opening a new restaurant branch in JBR — expect new asset entries and setup costs.",
            'created_at' => $now->copy(),
        ]);

        // 20. Tax Residency Certificate for Oasis — pending
        $t20 = Task::create([
            'created_by' => $admin->id,
            'service_id' => $services['Tax Residency Certificate'],
            'client_id' => $oasis->id,
            'responsible_id' => $sarah->id,
            'priority' => 'low',
            'status' => 'pending',
            'due_date' => $now->copy()->addDays(25),
            'instructions' => "TRC application for Oasis Hospitality Group. Client needs it to claim DTAA benefits on income from India (hotel management fees).\n\nRequirements: Valid trade license, audited financials for 1 year, lease agreement (Ejari), bank statement showing 6 months activity in UAE.",
            'created_at' => $now->copy(),
        ]);
    }
}
