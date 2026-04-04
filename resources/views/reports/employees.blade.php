@extends('reports.layout')
@section('title', 'Employee Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <div class="section-title">All Employees</div>

    <table>
        <thead>
            <tr>
                <th style="width:30px">#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th class="text-center" style="width:55px">Total</th>
                <th class="text-center" style="width:65px">Completed</th>
                <th class="text-center" style="width:45px">Rate</th>
                <th class="text-center" style="width:55px">On-Time</th>
                <th class="text-center" style="width:55px">Overdue</th>
                <th class="text-center" style="width:45px">Active</th>
                <th class="text-center" style="width:55px">Avg Days</th>
            </tr>
        </thead>
        <tbody>
            @forelse($employees as $i => $e)
                <tr>
                    <td class="text-center" style="color:#9ca3af">{{ $i + 1 }}</td>
                    <td style="font-weight:600">{{ $e['name'] }}</td>
                    <td>{{ $e['department'] }}</td>
                    <td>{{ $e['designation'] }}</td>
                    <td class="text-center">{{ $e['total_tasks'] }}</td>
                    <td class="text-center">{{ $e['completed'] }}</td>
                    <td class="text-center">
                        <span class="badge {{ $e['completion_rate'] >= 80 ? 'badge-green' : ($e['completion_rate'] >= 50 ? 'badge-amber' : 'badge-red') }}">
                            {{ $e['completion_rate'] }}%
                        </span>
                    </td>
                    <td class="text-center">{{ $e['on_time_rate'] }}%</td>
                    <td class="text-center">
                        @if($e['overdue'] > 0)
                            <span class="badge badge-red">{{ $e['overdue'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                    <td class="text-center">{{ $e['active_tasks'] }}</td>
                    <td class="text-center">{{ $e['avg_days'] ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="11" class="text-center" style="padding:20px;color:#9ca3af">No employees found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-footer">
        <strong>Total:</strong> {{ count($employees) }} employee(s) &nbsp;&bull;&nbsp;
        <strong>Avg Completion Rate:</strong> {{ count($employees) > 0 ? round(collect($employees)->avg('completion_rate')) : 0 }}% &nbsp;&bull;&nbsp;
        <strong>Total Overdue:</strong> {{ collect($employees)->sum('overdue') }}
    </div>
@endsection
