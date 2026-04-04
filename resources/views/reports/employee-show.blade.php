@extends('reports.layout')
@section('title', 'Employee Performance Report')

@section('content')
    {{-- Employee Banner --}}
    <div class="employee-banner">
        {{ $employee['name'] }}
        <span class="dept">{{ $employee['department'] }} &mdash; {{ $employee['designation'] }}</span>
    </div>

    {{-- Employee Details --}}
    <table class="info-grid">
        <tr><td class="label">Email</td><td>{{ $employee['email'] }}</td></tr>
        <tr><td class="label">Department</td><td>{{ $employee['department'] }}</td></tr>
        <tr><td class="label">Designation</td><td>{{ $employee['designation'] }}</td></tr>
        <tr><td class="label">Date of Joining</td><td>{{ $employee['date_of_joining'] ?? '-' }}</td></tr>
    </table>

    {{-- KPIs --}}
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
                    <div class="kpi-value {{ $kpis['overdue'] > 0 ? 'danger' : '' }}">{{ $kpis['overdue'] }}</div>
                    <div class="kpi-label">Overdue</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- Priority Breakdown --}}
    <div class="section-title">Task Breakdown by Priority</div>
    <table>
        <thead>
            <tr>
                <th>Priority</th>
                <th class="text-center" style="width:80px">Total</th>
                <th class="text-center" style="width:80px">Completed</th>
                <th class="text-center" style="width:80px">Rate</th>
            </tr>
        </thead>
        <tbody>
            @forelse($priority_breakdown as $row)
                <tr>
                    <td style="font-weight:600">{{ $row['name'] }}</td>
                    <td class="text-center">{{ $row['total'] }}</td>
                    <td class="text-center">{{ $row['completed'] }}</td>
                    <td class="text-center">
                        @php $rate = $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0; @endphp
                        <span class="badge {{ $rate >= 80 ? 'badge-green' : ($rate >= 50 ? 'badge-amber' : 'badge-red') }}">{{ $rate }}%</span>
                    </td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center" style="padding:16px;color:#9ca3af">No tasks found.</td></tr>
            @endforelse
        </tbody>
    </table>

    {{-- Service Performance --}}
    <div class="section-title">Service Performance</div>
    <table>
        <thead>
            <tr>
                <th>Service</th>
                <th class="text-center" style="width:80px">Total</th>
                <th class="text-center" style="width:80px">Completed</th>
                <th class="text-center" style="width:80px">Rate</th>
            </tr>
        </thead>
        <tbody>
            @forelse($service_performance as $row)
                <tr>
                    <td style="font-weight:600">{{ $row['name'] }}</td>
                    <td class="text-center">{{ $row['total'] }}</td>
                    <td class="text-center">{{ $row['completed'] }}</td>
                    <td class="text-center">
                        @php $rate = $row['total'] > 0 ? round(($row['completed'] / $row['total']) * 100) : 0; @endphp
                        <span class="badge {{ $rate >= 80 ? 'badge-green' : ($rate >= 50 ? 'badge-amber' : 'badge-red') }}">{{ $rate }}%</span>
                    </td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center" style="padding:16px;color:#9ca3af">No tasks found.</td></tr>
            @endforelse
        </tbody>
    </table>

    {{-- Collaboration --}}
    <div class="section-title">Collaboration Statistics</div>
    <div class="collab-row">
        <table>
            <tr>
                <td>
                    <div class="collab-value">{{ $collaboration['tasks_collaborated'] }}</div>
                    <div class="collab-label">Tasks Collaborated</div>
                </td>
                <td>
                    <div class="collab-value">{{ $collaboration['comments_posted'] }}</div>
                    <div class="collab-label">Comments Posted</div>
                </td>
                <td>
                    <div class="collab-value">{{ $collaboration['attachments_uploaded'] }}</div>
                    <div class="collab-label">Attachments Uploaded</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- Recent Tasks --}}
    <div class="section-title">Recent Completed Tasks</div>
    <table>
        <thead>
            <tr>
                <th>Service</th>
                <th>Customer</th>
                <th class="text-center">Priority</th>
                <th>Due Date</th>
                <th>Completed</th>
                <th class="text-center" style="width:50px">Days</th>
                <th class="text-center" style="width:60px">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($recent_tasks as $t)
                <tr>
                    <td>{{ $t['service_name'] }}</td>
                    <td>{{ $t['customer_name'] }}</td>
                    <td class="text-center">
                        <span class="badge {{ $t['priority'] === 'urgent' ? 'badge-red' : ($t['priority'] === 'high' ? 'badge-amber' : ($t['priority'] === 'medium' ? 'badge-blue' : 'badge-gray')) }}">
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
                <tr><td colspan="7" class="text-center" style="padding:16px;color:#9ca3af">No completed tasks found.</td></tr>
            @endforelse
        </tbody>
    </table>
@endsection
