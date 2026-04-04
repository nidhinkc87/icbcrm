<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AllEmployeesPerformanceExport implements WithMultipleSheets
{
    public function __construct(private array $employees) {}

    public function sheets(): array
    {
        $sheets = [];

        foreach ($this->employees as $emp) {
            $name = substr(preg_replace('/[^\w\s-]/', '', $emp['employee']['name']), 0, 28);
            $sheets[$name] = new EmployeePerformanceSheet($emp);
        }

        return $sheets;
    }
}
