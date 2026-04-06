<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeOutExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function __construct(private array $rows) {}

    public function headings(): array
    {
        return ['#', 'Date', 'Employee Name', 'Out Status', 'Location', 'Timing', 'Reason'];
    }

    public function array(): array
    {
        return collect($this->rows)->map(fn ($r, $i) => [
            $i + 1,
            $r['date'],
            $r['employee_name'],
            $r['status'],
            $r['location'],
            $r['timing'],
            $r['reason'],
        ])->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
