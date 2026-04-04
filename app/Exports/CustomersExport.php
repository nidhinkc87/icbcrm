<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomersExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function __construct(private array $rows) {}

    public function headings(): array
    {
        return ['#', 'Customer Name', 'Email', 'Phone', 'Emirate', 'Legal Type', 'Trade License', 'Total Docs', 'Expired Docs', 'Expiring Soon', 'Total Tasks', 'Pending Tasks'];
    }

    public function array(): array
    {
        return collect($this->rows)->map(fn ($c, $i) => [
            $i + 1,
            $c['name'],
            $c['email'],
            $c['phone'],
            $c['emirate'],
            $c['legal_type'],
            $c['trade_license_no'],
            $c['total_docs'],
            $c['expired_docs'],
            $c['expiring_docs'],
            $c['total_tasks'],
            $c['pending_tasks'],
        ])->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
