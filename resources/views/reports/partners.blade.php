@extends('reports.layout')
@section('title', 'Partner Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Partner Name</th>
                <th>Customer</th>
                <th>Emirates ID</th>
                <th>Passport No</th>
                <th class="text-center">Total Docs</th>
                <th class="text-center">Expired</th>
                <th class="text-center">Expiring Soon</th>
            </tr>
        </thead>
        <tbody>
            @forelse($partners as $i => $p)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $p['name'] }}</td>
                    <td>{{ $p['customer_name'] }}</td>
                    <td>{{ $p['emirates_id_no'] }}</td>
                    <td>{{ $p['passport_no'] }}</td>
                    <td class="text-center">{{ $p['total_docs'] }}</td>
                    <td class="text-center">
                        @if($p['expired_docs'] > 0)
                            <span class="badge badge-red">{{ $p['expired_docs'] }}</span>
                        @else
                            0
                        @endif
                    </td>
                    <td class="text-center">
                        @if($p['expiring_docs'] > 0)
                            <span class="badge badge-amber">{{ $p['expiring_docs'] }}</span>
                        @else
                            0
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="8" class="text-center">No partners found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div style="font-size: 10px; color: #6b7280; margin-top: 8px;">
        Total: {{ count($partners) }} partner(s) &middot;
        Expired documents: {{ collect($partners)->sum('expired_docs') }}
    </div>
@endsection
