<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PartnersExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function __construct(private array $rows) {}

    public function headings(): array
    {
        return ['#', 'Partner Name', 'Customer', 'Emirates ID', 'Passport No', 'Total Docs', 'Expired Docs', 'Expiring Soon'];
    }

    public function array(): array
    {
        return collect($this->rows)->map(fn ($p, $i) => [
            $i + 1,
            $p['name'],
            $p['customer_name'],
            $p['emirates_id_no'],
            $p['passport_no'],
            $p['total_docs'],
            $p['expired_docs'],
            $p['expiring_docs'],
        ])->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
