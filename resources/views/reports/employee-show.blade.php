@extends('reports.layout')
@section('title', 'Employee Performance Report - ' . $employee['name'])

@section('content')
    <div class="section-title">Employee Details</div>
    <table class="info-grid">
        <tr><td class="label">Name</td><td>{{ $employee['name'] }}</td><td class="label">Email</td><td>{{ $employee['email'] }}</td></tr>
        <tr><td class="label">Department</td><td>{{ $employee['department'] }}</td><td class="label">Designation</td><td>{{ $employee['designation'] }}</td></tr>
        <tr><td class="label">Date of Joining</td><td>{{ $employee['date_of_joining'] ?? '-' }}</td><td></td><td></td></tr>
    </table>

    <div class="section-title">Key Performance Indicators</div>
    <div class="kpi-row">
        <table>
            <tr>
                <td>
                    <div class="kpi-value">{{ $kpis['total_tasks'] }}</div>
                    <div class="kpi-label">Total Tasks</div>
                </td>
                <td>
                    <div class="kpi-value">{{ $kpis['completed'] }}</div>
                    <div class="kpi-label">Completed</div>
                </td>
                <td>
                    <div class="kpi-value">{{ $kpis['on_time_rate'] }}%</div>
                    <div class="kpi-label">On-Time Rate</div>
                </td>
                <td>
                    <div class="kpi-value">{{ $kpis['avg_days'] }}</div>
                    <div class="kpi-label">Avg Days</div>
                </td>
                <td>
                    <div class="kpi-value">{{ $kpis['overdue'] }}</div>
                    <div class="kpi-label">Overdue</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Task Breakdown by Priority</div>
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
            @foreach($priority_breakdown as $row)
                <tr>
                    <td>{{ $row['name'] }}</td>
                    <td class="text-center">{{ $row['total'] }}</td>
                    <td class="text-center">{{ $row['completed'] }}</td>
                    <td class="text-center">{{ $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0 }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Service Performance</div>
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
            @foreach($service_performance as $row)
                <tr>
                    <td>{{ $row['name'] }}</td>
                    <td class="text-center">{{ $row['total'] }}</td>
                    <td class="text-center">{{ $row['completed'] }}</td>
                    <td class="text-center">{{ $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0 }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Recent Completed Tasks</div>
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
            @forelse($recent_tasks as $t)
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

    <div class="section-title">Collaboration Statistics</div>
    <table class="info-grid">
        <tr>
            <td class="label">Tasks Collaborated</td><td>{{ $collaboration['tasks_collaborated'] }}</td>
            <td class="label">Comments Posted</td><td>{{ $collaboration['comments_posted'] }}</td>
            <td class="label">Attachments Uploaded</td><td>{{ $collaboration['attachments_uploaded'] }}</td>
        </tr>
    </table>
@endsection
