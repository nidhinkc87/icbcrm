<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeShowSummarySheet implements FromArray, ShouldAutoSize, WithTitle, WithStyles
{
    public function __construct(private array $data) {}

    public function title(): string
    {
        return 'Summary';
    }

    public function array(): array
    {
        $emp = $this->data['employee'];
        $kpis = $this->data['kpis'];

        $rows = [
            ['Employee Performance Report'],
            [],
            ['Name', $emp['name']],
            ['Email', $emp['email']],
            ['Department', $emp['department']],
            ['Designation', $emp['designation']],
            ['Date of Joining', $emp['date_of_joining'] ?? '-'],
            [],
            ['Key Performance Indicators'],
            ['Total Tasks', $kpis['total_tasks']],
            ['Completed', $kpis['completed']],
            ['On-Time Rate', $kpis['on_time_rate'] . '%'],
            ['Avg Days to Complete', $kpis['avg_days']],
            ['Overdue', $kpis['overdue']],
            [],
            ['Priority Breakdown'],
            ['Priority', 'Total', 'Completed', 'Rate'],
        ];

        foreach ($this->data['priority_breakdown'] as $row) {
            $rate = $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0;
            $rows[] = [$row['name'], $row['total'], $row['completed'], $rate . '%'];
        }

        $rows[] = [];
        $rows[] = ['Service Performance'];
        $rows[] = ['Service', 'Total', 'Completed', 'Rate'];

        foreach ($this->data['service_performance'] as $row) {
            $rate = $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0;
            $rows[] = [$row['name'], $row['total'], $row['completed'], $rate . '%'];
        }

        $collab = $this->data['collaboration'];
        $rows[] = [];
        $rows[] = ['Collaboration Statistics'];
        $rows[] = ['Tasks Collaborated', $collab['tasks_collaborated']];
        $rows[] = ['Comments Posted', $collab['comments_posted']];
        $rows[] = ['Attachments Uploaded', $collab['attachments_uploaded']];

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            9 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
