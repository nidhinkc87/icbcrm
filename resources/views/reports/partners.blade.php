@extends('reports.layout')
@section('title', 'Partner Report')

@if($filtersMeta)
    @section('filters-meta', $filtersMeta)
@endif

@section('content')
    <div class="section-title">All Partners</div>

    <table>
        <thead>
            <tr>
                <th style="width:30px">#</th>
                <th>Partner Name</th>
                <th>Customer</th>
                <th>Emirates ID</th>
                <th>Passport No</th>
                <th class="text-center" style="width:65px">Total Docs</th>
                <th class="text-center" style="width:55px">Expired</th>
                <th class="text-center" style="width:75px">Expiring Soon</th>
            </tr>
        </thead>
        <tbody>
            @forelse($partners as $i => $p)
                <tr>
                    <td class="text-center" style="color:#9ca3af">{{ $i + 1 }}</td>
                    <td style="font-weight:600">{{ $p['name'] }}</td>
                    <td>{{ $p['customer_name'] }}</td>
                    <td>{{ $p['emirates_id_no'] }}</td>
                    <td>{{ $p['passport_no'] }}</td>
                    <td class="text-center">{{ $p['total_docs'] }}</td>
                    <td class="text-center">
                        @if($p['expired_docs'] > 0)
                            <span class="badge badge-red">{{ $p['expired_docs'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                    <td class="text-center">
                        @if($p['expiring_docs'] > 0)
                            <span class="badge badge-amber">{{ $p['expiring_docs'] }}</span>
                        @else
                            <span style="color:#9ca3af">0</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="8" class="text-center" style="padding:20px;color:#9ca3af">No partners found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-footer">
        <strong>Total:</strong> {{ count($partners) }} partner(s) &nbsp;&bull;&nbsp;
        <strong>Expired Documents:</strong> {{ collect($partners)->sum('expired_docs') }}
    </div>
@endsection
