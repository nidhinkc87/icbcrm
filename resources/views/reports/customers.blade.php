@extends('reports.layout')
@section('title', 'Customer Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <div class="section-title">All Customers</div>

    <table>
        <thead>
            <tr>
                <th style="width:30px">#</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Emirate</th>
                <th>Legal Type</th>
                <th>Trade License</th>
                <th class="text-center" style="width:45px">Docs</th>
                <th class="text-center" style="width:55px">Expired</th>
                <th class="text-center" style="width:55px">Expiring</th>
                <th class="text-center" style="width:45px">Tasks</th>
                <th class="text-center" style="width:55px">Pending</th>
            </tr>
        </thead>
        <tbody>
            @forelse($customers as $i => $c)
                <tr>
                    <td class="text-center" style="color:#9ca3af">{{ $i + 1 }}</td>
                    <td style="font-weight:600">{{ $c['name'] }}</td>
                    <td style="color:#6b7280">{{ $c['email'] }}</td>
                    <td>{{ $c['phone'] }}</td>
                    <td>{{ $c['emirate'] }}</td>
                    <td>{{ $c['legal_type'] }}</td>
                    <td>{{ $c['trade_license_no'] }}</td>
                    <td class="text-center">{{ $c['total_docs'] }}</td>
                    <td class="text-center">
                        @if($c['expired_docs'] > 0)
                            <span class="badge badge-red">{{ $c['expired_docs'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                    <td class="text-center">
                        @if($c['expiring_docs'] > 0)
                            <span class="badge badge-amber">{{ $c['expiring_docs'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                    <td class="text-center">{{ $c['total_tasks'] }}</td>
                    <td class="text-center">
                        @if($c['pending_tasks'] > 0)
                            <span class="badge badge-amber">{{ $c['pending_tasks'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="12" class="text-center" style="padding:20px;color:#9ca3af">No customers found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-footer">
        <strong>Total:</strong> {{ count($customers) }} customer(s) &nbsp;&bull;&nbsp;
        <strong>Expired Documents:</strong> {{ collect($customers)->sum('expired_docs') }} &nbsp;&bull;&nbsp;
        <strong>Pending Tasks:</strong> {{ collect($customers)->sum('pending_tasks') }}
    </div>
@endsection
