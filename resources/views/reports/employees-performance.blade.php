@extends('reports.layout')
@section('title', 'All Employees Performance Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    @foreach($employees as $index => $emp)
        @if($index > 0)
            <div class="page-break"></div>
        @endif

        <div class="section-title">{{ $emp['employee']['name'] }}</div>
        <table class="info-grid">
            <tr>
                <td class="label">Name</td><td>{{ $emp['employee']['name'] }}</td>
                <td class="label">Email</td><td>{{ $emp['employee']['email'] }}</td>
            </tr>
            <tr>
                <td class="label">Department</td><td>{{ $emp['employee']['department'] }}</td>
                <td class="label">Designation</td><td>{{ $emp['employee']['designation'] }}</td>
            </tr>
            <tr>
                <td class="label">Date of Joining</td><td>{{ $emp['employee']['date_of_joining'] ?? '-' }}</td>
                <td></td><td></td>
            </tr>
        </table>

        <div class="section-title" style="margin-top:10px">Key Performance Indicators</div>
        <div class="kpi-row">
            <table>
                <tr>
                    <td>
                        <div class="kpi-value">{{ $emp['kpis']['total_tasks'] }}</div>
                        <div class="kpi-label">Total Tasks</div>
                    </td>
                    <td>
                        <div class="kpi-value">{{ $emp['kpis']['completed'] }}</div>
                        <div class="kpi-label">Completed</div>
                    </td>
                    <td>
                        <div class="kpi-value">{{ $emp['kpis']['on_time_rate'] }}%</div>
                        <div class="kpi-label">On-Time Rate</div>
                    </td>
                    <td>
                        <div class="kpi-value">{{ $emp['kpis']['avg_days'] }}</div>
                        <div class="kpi-label">Avg Days</div>
                    </td>
                    <td>
                        <div class="kpi-value">{{ $emp['kpis']['overdue'] }}</div>
                        <div class="kpi-label">Overdue</div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section-title" style="margin-top:10px">Task Breakdown by Priority</div>
        <table>
            <thead>
                <tr>
                    <th>Priority</th>
                    <th class="text-center">Total</th>
                    <th class="text-center">Completed</th>
                    <th class="text-center">Rate</th>
                </tr>
            </thead>
            <tbody>
                @forelse($emp['priority_breakdown'] as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="text-center">{{ $row['total'] }}</td>
                        <td class="text-center">{{ $row['completed'] }}</td>
                        <td class="text-center">{{ $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0 }}%</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="text-center">No tasks</td></tr>
                @endforelse
            </tbody>
        </table>

        <div class="section-title" style="margin-top:10px">Service Performance</div>
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-center">Total</th>
                    <th class="text-center">Completed</th>
                    <th class="text-center">Rate</th>
                </tr>
            </thead>
            <tbody>
                @forelse($emp['service_performance'] as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="text-center">{{ $row['total'] }}</td>
                        <td class="text-center">{{ $row['completed'] }}</td>
                        <td class="text-center">{{ $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0 }}%</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="text-center">No tasks</td></tr>
                @endforelse
            </tbody>
        </table>

        <div class="section-title" style="margin-top:10px">Recent Completed Tasks</div>
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Completed</th>
                    <th class="text-center">Days</th>
                    <th class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($emp['recent_tasks'] as $t)
                    <tr>
                        <td>{{ $t['service_name'] }}</td>
                        <td>{{ $t['customer_name'] }}</td>
                        <td>
                            <span class="badge {{ $t['priority'] === 'urgent' ? 'badge-red' : ($t['priority'] === 'high' ? 'badge-amber' : 'badge-gray') }}">
                                {{ ucfirst($t['priority']) }}
                            </span>
                        </td>
                        <td>{{ $t['due_date'] }}</td>
                        <td>{{ $t['completed_at'] }}</td>
                        <td class="text-center">{{ $t['days_taken'] }}</td>
                        <td class="text-center">
                            <span class="badge {{ $t['on_time'] ? 'badge-green' : 'badge-red' }}">
                                {{ $t['on_time'] ? 'On Time' : 'Late' }}
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="text-center">No completed tasks found.</td></tr>
                @endforelse
            </tbody>
        </table>

        <div class="section-title" style="margin-top:10px">Collaboration Statistics</div>
        <table class="info-grid">
            <tr>
                <td class="label">Tasks Collaborated</td><td>{{ $emp['collaboration']['tasks_collaborated'] }}</td>
                <td class="label">Comments Posted</td><td>{{ $emp['collaboration']['comments_posted'] }}</td>
                <td class="label">Attachments Uploaded</td><td>{{ $emp['collaboration']['attachments_uploaded'] }}</td>
            </tr>
        </table>
    @endforeach
@endsection
