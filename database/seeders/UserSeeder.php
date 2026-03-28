<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // =================================================================
        // ADMINS
        // =================================================================

        $admins = [
            ['name' => 'Nidhin KC', 'email' => 'admin@icbcrm.com'],
            ['name' => 'Rashid Al Mansoori', 'email' => 'rashid@icbcrm.com'],
        ];

        foreach ($admins as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => $password, 'email_verified_at' => now()]
            );
            $user->syncRoles(['admin']);
        }

        // =================================================================
        // EMPLOYEES
        // =================================================================

        $employees = [
            ['name' => 'Sarah Ahmed', 'email' => 'sarah@icbcrm.com', 'phone' => '+971 55 412 8901', 'department' => 'Tax', 'designation' => 'Senior Tax Consultant', 'joined' => '2024-03-15'],
            ['name' => 'Mohammed Ali', 'email' => 'mohammed@icbcrm.com', 'phone' => '+971 50 673 2145', 'department' => 'Audit', 'designation' => 'Audit Manager', 'joined' => '2023-09-01'],
            ['name' => 'Fatima Hassan', 'email' => 'fatima@icbcrm.com', 'phone' => '+971 56 891 4532', 'department' => 'Corporate', 'designation' => 'Corporate Services Specialist', 'joined' => '2024-06-10'],
            ['name' => 'Omar Khalid', 'email' => 'omar@icbcrm.com', 'phone' => '+971 52 345 6789', 'department' => 'Tax', 'designation' => 'VAT Consultant', 'joined' => '2025-01-12'],
            ['name' => 'Aisha Mahmoud', 'email' => 'aisha@icbcrm.com', 'phone' => '+971 54 218 7643', 'department' => 'Accounting', 'designation' => 'Senior Accountant', 'joined' => '2024-11-01'],
            ['name' => 'Yusuf Ibrahim', 'email' => 'yusuf@icbcrm.com', 'phone' => '+971 58 765 3210', 'department' => 'Tax', 'designation' => 'Corporate Tax Analyst', 'joined' => '2025-06-15'],
            ['name' => 'Priya Nair', 'email' => 'priya@icbcrm.com', 'phone' => '+971 50 132 9876', 'department' => 'Corporate', 'designation' => 'PRO & Visa Coordinator', 'joined' => '2025-02-20'],
            ['name' => 'Khalid Zayed', 'email' => 'khalid@icbcrm.com', 'phone' => '+971 55 908 4321', 'department' => 'Audit', 'designation' => 'Internal Auditor', 'joined' => '2024-08-05'],
        ];

        foreach ($employees as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => $password, 'email_verified_at' => now()]
            );
            $user->syncRoles(['employee']);

            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $data['phone'],
                    'department' => $data['department'],
                    'designation' => $data['designation'],
                    'date_of_joining' => Carbon::parse($data['joined']),
                ]
            );
        }

        // =================================================================
        // CLIENTS
        // =================================================================

        $customers = [
            ['name' => 'Al Maktoum Trading LLC', 'email' => 'info@almaktoumtrading.ae', 'phone' => '+971 4 345 6789', 'address' => 'Office 1205, Citadel Tower, Business Bay', 'city' => 'Dubai', 'emirate' => 'Dubai', 'po_box' => '45231'],
            ['name' => 'Gulf Star Enterprises', 'email' => 'accounts@gulfstar.ae', 'phone' => '+971 2 678 1234', 'address' => 'Suite 403, Al Reem Tower, Al Reem Island', 'city' => 'Abu Dhabi', 'emirate' => 'Abu Dhabi', 'po_box' => '78456'],
            ['name' => 'Emirates Tech Solutions FZE', 'email' => 'finance@emiratestech.ae', 'phone' => '+971 6 543 8765', 'address' => 'Warehouse 12, SAIF Zone', 'city' => 'Sharjah', 'emirate' => 'Sharjah', 'po_box' => '12098'],
            ['name' => 'Falcon Logistics Co LLC', 'email' => 'ops@falconlogistics.ae', 'phone' => '+971 4 421 9087', 'address' => 'Office 302, Jebel Ali Free Zone', 'city' => 'Dubai', 'emirate' => 'Dubai', 'po_box' => '34567'],
            ['name' => 'Oasis Hospitality Group', 'email' => 'admin@oasishospitality.ae', 'phone' => '+971 7 234 5678', 'address' => 'Al Hamra Business Zone, Plot 23', 'city' => 'Ras Al Khaimah', 'emirate' => 'Ras Al Khaimah', 'po_box' => '56789'],
            ['name' => 'Zenith Real Estate DMCC', 'email' => 'info@zenithre.ae', 'phone' => '+971 4 876 5432', 'address' => 'Unit 1806, Jumeirah Bay X2, JLT', 'city' => 'Dubai', 'emirate' => 'Dubai', 'po_box' => '89012'],
            ['name' => 'Pearl Marine Services LLC', 'email' => 'accounts@pearlmarine.ae', 'phone' => '+971 6 712 3456', 'address' => 'Office 15, Hamriyah Free Zone', 'city' => 'Sharjah', 'emirate' => 'Sharjah', 'po_box' => '23456'],
            ['name' => 'Burj Contracting & Engineering', 'email' => 'finance@burjcontracting.ae', 'phone' => '+971 2 987 6543', 'address' => 'Villa 8, Musaffah Industrial Area M-37', 'city' => 'Abu Dhabi', 'emirate' => 'Abu Dhabi', 'po_box' => '67890'],
            ['name' => 'Noor Medical Center LLC', 'email' => 'admin@noormedical.ae', 'phone' => '+971 9 345 1234', 'address' => 'Ground Floor, Creative Tower, Fujairah', 'city' => 'Fujairah', 'emirate' => 'Fujairah', 'po_box' => '11234'],
            ['name' => 'Sands F&B Management FZCO', 'email' => 'info@sandsfb.ae', 'phone' => '+971 4 567 8901', 'address' => 'Office 2401, One by Omniyat, Business Bay', 'city' => 'Dubai', 'emirate' => 'Dubai', 'po_box' => '90123'],
        ];

        foreach ($customers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => $password, 'email_verified_at' => now()]
            );
            $user->syncRoles(['customer']);

            Customer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $data['phone'],
                    'address_line' => $data['address'],
                    'city' => $data['city'],
                    'emirate' => $data['emirate'],
                    'country' => 'UAE',
                    'po_box' => $data['po_box'],
                ]
            );
        }
    }
}
