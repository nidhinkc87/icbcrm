<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskQuery;
use App\Models\TaskQueryResponse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TaskQuerySeeder extends Seeder
{
    public function run(): void
    {
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

        $now = Carbon::now();
        $tasks = Task::with('service')->get()->keyBy('id');

        // Find tasks by service name for reliable referencing
        $taskByService = fn (string $name) => Task::whereHas('service', fn ($q) => $q->where('name', $name))->first();

        $vatReturn = $taskByService('VAT Return Filing');
        $esrNotification = $taskByService('ESR Notification Filing');
        $companyFormation = $taskByService('Company Formation - Mainland');
        $penaltyRecon = $taskByService('FTA Penalty Reconsideration');
        $transferPricing = $taskByService('Transfer Pricing');
        $financialStatements = $taskByService('Financial Statements Preparation');
        $voluntaryDisclosure = $taskByService('Voluntary Disclosure');
        $visaProcessing = $taskByService('Employment Visa Processing');
        $ctReturn = $taskByService('Corporate Tax Return Filing');
        $internalAudit = $taskByService('Internal Audit');
        $amlSetup = $taskByService('AML Compliance Setup');
        $goldenVisa = $taskByService('Golden Visa Application');
        $trc = $taskByService('Tax Residency Certificate');

        // =================================================================
        // ESR NOTIFICATION — queries about relevant activities
        // =================================================================

        if ($esrNotification) {
            $q = TaskQuery::create([
                'task_id' => $esrNotification->id,
                'raised_by' => $yusuf->id,
                'directed_to' => $rashid->id,
                'subject' => 'Adequate substance test — number of employees',
                'description' => "Zenith Real Estate DMCC has only 2 full-time employees (a director and an admin). For holding company activity, the ESR adequate substance test requires:\n\n1. Adequate number of qualified employees\n2. Adequate expenditure in the UAE\n3. Core Income Generating Activities (CIGA) in the UAE\n\nWith only 2 employees, will they pass the substance test? Should we recommend they hire additional staff or outsource CIGA to a UAE service provider?",
                'priority' => 'normal',
                'status' => 'answered',
                'created_at' => $now->copy()->subDays(2),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $rashid->id, 'body' => "For pure holding companies, the substance requirement is lighter — they need to demonstrate that strategic decisions regarding the subsidiaries are made in the UAE.\n\nWith 2 employees, they should be fine IF:\n- Board meetings are held in the UAE (get meeting minutes)\n- The director makes dividend/investment decisions from the UAE office\n- They have adequate office space (not just a virtual address)\n\nDocument all of this in the ESR Report. No need to hire additional staff for now.", 'created_at' => $now->copy()->subDays(1)]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $yusuf->id, 'body' => "Understood. I'll collect the board meeting minutes for FY 2025 and verify the Ejari lease agreement. Will also check if the director's travel records show he was in the UAE during key decision dates.", 'created_at' => $now->copy()->subHours(18)]);
        }

        // =================================================================
        // FINANCIAL STATEMENTS — IFRS query
        // =================================================================

        if ($financialStatements) {
            $q = TaskQuery::create([
                'task_id' => $financialStatements->id,
                'raised_by' => $aisha->id,
                'directed_to' => $mohammed->id,
                'subject' => 'IFRS 16 — lease classification for vessel berth agreement',
                'description' => "Pearl Marine has a 3-year vessel berth agreement with Hamriyah Port Authority (AED 180,000/year). The agreement gives them exclusive use of a designated berth.\n\nUnder IFRS 16, this appears to be a lease (identified asset + right to control use). However, the port authority can relocate them to an equivalent berth with 30 days notice.\n\nDoes the relocation clause mean this is NOT a lease under IFRS 16? Or should we still recognize a right-of-use asset?",
                'priority' => 'normal',
                'status' => 'answered',
                'created_at' => $now->copy()->subDays(2),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $mohammed->id, 'body' => "Good catch. If the port authority has a substantive right to substitute the berth (and would economically benefit from doing so), then it's NOT an identified asset under IFRS 16.B14-B18.\n\nHowever, if the relocation clause is only for emergencies or rare maintenance — it's not substantive, and you should treat it as a lease.\n\nCheck the actual contract language. In my experience with port agreements in UAE, these clauses are rarely exercised — so it's likely a lease. Recognize the ROU asset at present value of AED 540,000 (3 years × 180K, discounted).", 'created_at' => $now->copy()->subDays(1)]);

            $q2 = TaskQuery::create([
                'task_id' => $financialStatements->id,
                'raised_by' => $aisha->id,
                'directed_to' => $admin->id,
                'subject' => 'Bank confirmation letter — Emirates NBD not responding',
                'description' => "I sent the bank confirmation request to Emirates NBD (Industrial City branch) two weeks ago. No response yet. The bank balance is AED 1.4M and is material to the financial statements.\n\nShould I follow up again, or can we use the client's bank statement as alternative evidence? The auditor (Mohammed) may need the confirmation for the audit file.",
                'priority' => 'urgent',
                'status' => 'open',
                'created_at' => $now->copy()->subDays(1),
            ]);
        }

        // =================================================================
        // VISA PROCESSING — GDRFA query
        // =================================================================

        if ($visaProcessing) {
            $q = TaskQuery::create([
                'task_id' => $visaProcessing->id,
                'raised_by' => $priya->id,
                'directed_to' => $admin->id,
                'subject' => 'GDRFA appointment delay — visa expiry risk',
                'description' => "Dr. Patel's entry permit will expire on April 5, 2026. The earliest GDRFA appointment for residence visa stamping is April 3.\n\nIf the appointment gets rescheduled or delayed, we risk the entry permit expiring. Should I:\n1. Try to get an earlier walk-in slot at Al Aweer center?\n2. Apply for a 30-day entry permit extension as a safety net (AED 600)?\n3. Both?\n\nThe client is anxious as the doctor needs to start at the hospital by April 7.",
                'priority' => 'urgent',
                'status' => 'answered',
                'created_at' => $now->copy()->subDays(3),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $admin->id, 'body' => "Apply for the 30-day extension immediately — AED 600 is a small price for the safety net. Don't rely on walk-in slots, they're unpredictable.\n\nAlso keep the April 3 appointment. If it goes through, the extension fee is a minor cost. If the appointment fails, at least we have the buffer.\n\nInform the client and Noor Medical HR about the situation.", 'created_at' => $now->copy()->subDays(2)]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $priya->id, 'body' => 'Extension submitted on ICA smart services. Approved instantly — new expiry is May 4, 2026. Client and HR have been informed. Keeping the April 3 GDRFA appointment as planned.', 'created_at' => $now->copy()->subDays(1)]);
        }

        // =================================================================
        // CORPORATE TAX RETURN — QFZP eligibility
        // =================================================================

        if ($ctReturn) {
            $q = TaskQuery::create([
                'task_id' => $ctReturn->id,
                'raised_by' => $yusuf->id,
                'directed_to' => $sarah->id,
                'subject' => 'QFZP eligibility — de minimis requirement',
                'description' => "Emirates Tech Solutions FZE (SAIF Zone) had total revenue of AED 8.2M in FY 2025. Of this:\n- AED 7.5M from trading electronics to non-free zone mainland customers\n- AED 500K from sales to other SAIF Zone companies\n- AED 200K from consulting services to a Dubai mainland company\n\nTo qualify as QFZP, non-qualifying revenue must not exceed the de minimis threshold (lower of 5% of total revenue or AED 5M).\n\nThe AED 200K consulting to mainland appears to be non-qualifying revenue. 200K/8.2M = 2.4% which is under 5%. Does the AED 7.5M mainland trading also count as non-qualifying?",
                'priority' => 'urgent',
                'status' => 'open',
                'created_at' => $now->copy()->subDays(1),
            ]);
        }

        // =================================================================
        // INTERNAL AUDIT — scope query
        // =================================================================

        if ($internalAudit) {
            $q = TaskQuery::create([
                'task_id' => $internalAudit->id,
                'raised_by' => $khalid->id,
                'directed_to' => $rashid->id,
                'subject' => 'Should we include WPS compliance in audit scope?',
                'description' => "While reviewing Burj Contracting's payroll, I noticed they have 180+ workers on 3 active construction projects. The original scope covers procurement and project costs.\n\nHowever, WPS (Wage Protection System) compliance is a significant risk area — MOHRE can impose heavy fines for late salary payments. In 2025, they had 2 instances where salaries were paid 5+ days late.\n\nShould we expand the scope to include WPS compliance review? It would add approximately 3-4 days of fieldwork.",
                'priority' => 'normal',
                'status' => 'answered',
                'created_at' => $now->copy()->subDays(1),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $rashid->id, 'body' => "Yes, include WPS in the scope. Late salary payments are a regulatory risk and a reputational one — MOHRE can blacklist the company from new work permits.\n\nAdd it as a separate section in the report. Focus on:\n1. Timeliness of WPS transfers (check all 12 months)\n2. Match between WPS amounts and employment contracts\n3. Any workers not registered in WPS\n\nInform the client about the scope expansion. The extra 3-4 days is justified.", 'created_at' => $now->copy()->subHours(10)]);
        }

        // =================================================================
        // AML COMPLIANCE — goAML query
        // =================================================================

        if ($amlSetup) {
            $q = TaskQuery::create([
                'task_id' => $amlSetup->id,
                'raised_by' => $fatima->id,
                'directed_to' => $admin->id,
                'subject' => 'goAML registration — which entity type for F&B company?',
                'description' => "Sands F&B Management FZCO is primarily a restaurant management company. For goAML registration, I need to select the correct DNFBP category.\n\nThey are NOT a real estate agent, dealer in precious metals/stones, or auditor. However, they DO accept cash payments exceeding AED 55,000 at their fine-dining venue for large private events.\n\nAre they classified as a 'Dealer' under the AML regulations due to high-value cash transactions? Or are they exempt as they're primarily in the F&B business?",
                'priority' => 'normal',
                'status' => 'open',
                'created_at' => $now->copy()->subHours(12),
            ]);
        }

        // =================================================================
        // GOLDEN VISA — property route query
        // =================================================================

        if ($goldenVisa) {
            $q = TaskQuery::create([
                'task_id' => $goldenVisa->id,
                'raised_by' => $priya->id,
                'directed_to' => $admin->id,
                'subject' => 'Dual eligibility — investor vs property route',
                'description' => "Mr. Ahmed Al Maktoum qualifies through the investor route (company capital > AED 2M). However, he also owns a villa in Emirates Hills valued at AED 4.5M (mortgage-free).\n\nThe property investor route (AED 2M+ property) may be faster to process as it goes through the Dubai Land Department.\n\nShould we apply through the investor route (business) or the property route? Or can we submit both and see which gets approved first?",
                'priority' => 'normal',
                'status' => 'answered',
                'created_at' => $now->copy()->subHours(8),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $admin->id, 'body' => "Go with the property route through Dubai Land Department. It's significantly faster (2-3 weeks vs 4-6 weeks for the business route through ICA).\n\nThe property is mortgage-free and above AED 2M, so it's straightforward. Documents needed:\n1. Title deed from DLD\n2. Passport copy\n3. Emirates ID\n4. 6-month bank statement\n5. Good conduct certificate\n\nDon't submit both simultaneously — it causes confusion in the system. If the property route fails for any reason, we can always fall back to the investor route.", 'created_at' => $now->copy()->subHours(5)]);
        }

        // =================================================================
        // TAX RESIDENCY CERTIFICATE — DTAA query
        // =================================================================

        if ($trc) {
            $q = TaskQuery::create([
                'task_id' => $trc->id,
                'raised_by' => $sarah->id,
                'directed_to' => $rashid->id,
                'subject' => 'TRC validity period — client needs it for FY 2025 Indian income',
                'description' => "Oasis Hospitality Group earned AED 850,000 in hotel management fees from their Indian partner in FY 2025 (April 2025 - March 2026). India withheld 10% TDS (AED 85,000).\n\nTo claim DTAA benefit and reduce the withholding rate, they need a UAE TRC. However, the FTA issues TRCs for a calendar year.\n\nThe client's income period is April 2025 - March 2026. Do we need two TRCs (2025 and 2026) to cover the full Indian financial year? Or will one TRC suffice?",
                'priority' => 'normal',
                'status' => 'open',
                'created_at' => $now->copy()->subHours(4),
            ]);
        }

        // =================================================================
        // VOLUNTARY DISCLOSURE — additional error found
        // =================================================================

        if ($voluntaryDisclosure) {
            $q = TaskQuery::create([
                'task_id' => $voluntaryDisclosure->id,
                'raised_by' => $omar->id,
                'directed_to' => $sarah->id,
                'subject' => 'Additional error found — should we include in same VD?',
                'description' => "While reviewing Falcon Logistics' Q3 2025 records for the Voluntary Disclosure, I found another error:\n\nThey imported goods worth AED 340,000 from China and self-accounted for reverse charge VAT on the import (AED 17,000). However, the customs declaration shows the goods were actually imported via Jebel Ali Free Zone where VAT was already paid at customs.\n\nThis means they double-counted the VAT — once at customs and once via reverse charge. The input VAT claim of AED 17,000 on the reverse charge is incorrect.\n\nTotal correction now: AED 28,000 (entertainment) + AED 17,000 (double reverse charge) = AED 45,000.\n\nShould we include both errors in one Voluntary Disclosure or file separately?",
                'priority' => 'urgent',
                'status' => 'answered',
                'created_at' => $now->copy()->subDays(2),
            ]);
            TaskQueryResponse::create(['query_id' => $q->id, 'user_id' => $sarah->id, 'body' => "Include both in the same Voluntary Disclosure. Filing multiple VDs for the same tax period attracts a separate fixed penalty (AED 3,000) for each filing. One VD = one penalty.\n\nUpdate the Form VAT 211 to reflect the total correction of AED 45,000. The penalty calculation now becomes:\n- Fixed penalty: AED 3,000\n- Variable penalty: 1% per month on AED 45,000 × 6 months = AED 2,700\n- Total: AED 45,000 (tax) + AED 5,700 (penalties) = AED 50,700\n\nUpdate the client on the revised figures before submitting.", 'created_at' => $now->copy()->subDays(1)]);
        }
    }
}
