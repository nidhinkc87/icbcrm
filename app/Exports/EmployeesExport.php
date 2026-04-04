<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeesExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function __construct(private array $rows) {}

    public function headings(): array
    {
        return ['#', 'Name', 'Department', 'Designation', 'Total Tasks', 'Completed', 'Completion Rate %', 'On-Time Rate %', 'Overdue', 'Active', 'Avg Days'];
    }

    public function array(): array
    {
        return collect($this->rows)->map(fn ($e, $i) => [
            $i + 1,
            $e['name'],
            $e['department'],
            $e['designation'],
            $e['total_tasks'],
            $e['completed'],
            $e['completion_rate'],
            $e['on_time_rate'],
            $e['overdue'],
            $e['active_tasks'],
            $e['avg_days'] ?? '-',
        ])->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
