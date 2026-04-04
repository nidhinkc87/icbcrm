@extends('reports.layout')
@section('title', 'Customer Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Emirate</th>
                <th>Legal Type</th>
                <th>Trade License</th>
                <th class="text-center">Docs</th>
                <th class="text-center">Expired</th>
                <th class="text-center">Expiring</th>
                <th class="text-center">Tasks</th>
                <th class="text-center">Pending</th>
            </tr>
        </thead>
        <tbody>
            @forelse($customers as $i => $c)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c['name'] }}</td>
                    <td>{{ $c['email'] }}</td>
                    <td>{{ $c['phone'] }}</td>
                    <td>{{ $c['emirate'] }}</td>
                    <td>{{ $c['legal_type'] }}</td>
                    <td>{{ $c['trade_license_no'] }}</td>
                    <td class="text-center">{{ $c['total_docs'] }}</td>
                    <td class="text-center">
                        @if($c['expired_docs'] > 0)
                            <span class="badge badge-red">{{ $c['expired_docs'] }}</span>
                        @else
                            0
                        @endif
                    </td>
                    <td class="text-center">
                        @if($c['expiring_docs'] > 0)
                            <span class="badge badge-amber">{{ $c['expiring_docs'] }}</span>
                        @else
                            0
                        @endif
                    </td>
                    <td class="text-center">{{ $c['total_tasks'] }}</td>
                    <td class="text-center">
                        @if($c['pending_tasks'] > 0)
                            <span class="badge badge-amber">{{ $c['pending_tasks'] }}</span>
                        @else
                            0
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="12" class="text-center">No customers found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div style="font-size: 10px; color: #6b7280; margin-top: 8px;">
        Total: {{ count($customers) }} customer(s) &middot;
        Expired documents: {{ collect($customers)->sum('expired_docs') }} &middot;
        Pending tasks: {{ collect($customers)->sum('pending_tasks') }}
    </div>
@endsection
