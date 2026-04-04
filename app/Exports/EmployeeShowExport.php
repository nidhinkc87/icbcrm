<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmployeeShowExport implements WithMultipleSheets
{
    public function __construct(private array $data) {}

    public function sheets(): array
    {
        return [
            'Summary' => new EmployeeShowSummarySheet($this->data),
            'Tasks' => new EmployeeShowTasksSheet($this->data['recent_tasks']->toArray()),
        ];
    }
}
