@extends('reports.layout')
@section('title', 'Employee Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th class="text-center">Total Tasks</th>
                <th class="text-center">Completed</th>
                <th class="text-center">Rate</th>
                <th class="text-center">On-Time</th>
                <th class="text-center">Overdue</th>
                <th class="text-center">Active</th>
                <th class="text-center">Avg Days</th>
            </tr>
        </thead>
        <tbody>
            @forelse($employees as $i => $e)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $e['name'] }}</td>
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
                            0
                        @endif
                    </td>
                    <td class="text-center">{{ $e['active_tasks'] }}</td>
                    <td class="text-center">{{ $e['avg_days'] ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="11" class="text-center">No employees found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div style="font-size: 10px; color: #6b7280; margin-top: 8px;">
        Total: {{ count($employees) }} employee(s) &middot;
        Avg Completion Rate: {{ count($employees) > 0 ? round(collect($employees)->avg('completion_rate')) : 0 }}% &middot;
        Total Overdue: {{ collect($employees)->sum('overdue') }}
    </div>
@endsection
