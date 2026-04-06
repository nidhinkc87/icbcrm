@extends('reports.layout')
@section('title', 'Employee Out Report — ' . $monthLabel)

@section('content')
    <div class="section-title">Employee Onsite Records — {{ $monthLabel }}</div>

    <table>
        <thead>
            <tr>
                <th style="width:30px">#</th>
                <th>Date</th>
                <th>Employee Name</th>
                <th>Out Status</th>
                <th>Location</th>
                <th>Timing</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $i => $r)
                <tr>
                    <td class="text-center" style="color:#9ca3af">{{ $i + 1 }}</td>
                    <td>{{ $r['date'] }}</td>
                    <td style="font-weight:600">{{ $r['employee_name'] }}</td>
                    <td><span class="badge badge-amber">{{ $r['status'] }}</span></td>
                    <td>{{ $r['location'] }}</td>
                    <td>{{ $r['timing'] }}</td>
                    <td>{{ $r['reason'] }}</td>
                </tr>
            @empty
                <tr><td colspan="7" class="text-center" style="padding:20px;color:#9ca3af">No onsite records found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-footer">
        <strong>Total Records:</strong> {{ count($records) }}
    </div>
@endsection
