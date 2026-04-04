<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeShowTasksSheet implements FromArray, WithHeadings, ShouldAutoSize, WithTitle, WithStyles
{
    public function __construct(private array $tasks) {}

    public function title(): string
    {
        return 'Tasks';
    }

    public function headings(): array
    {
        return ['#', 'Service', 'Customer', 'Priority', 'Due Date', 'Completed', 'Days Taken', 'Status'];
    }

    public function array(): array
    {
        return collect($this->tasks)->map(fn ($t, $i) => [
            $i + 1,
            $t['service_name'],
            $t['customer_name'],
            ucfirst($t['priority']),
            $t['due_date'],
            $t['completed_at'],
            $t['days_taken'],
            $t['on_time'] ? 'On Time' : 'Late',
        ])->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
