<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title') - ICB CRM</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #065f46; padding-bottom: 10px; }
        .header h1 { font-size: 20px; color: #065f46; }
        .header .subtitle { font-size: 14px; color: #374151; margin-top: 4px; }
        .header .meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
        .section-title { font-size: 13px; font-weight: bold; color: #065f46; margin: 16px 0 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background-color: #065f46; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) td { background-color: #f9fafb; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-gray { background: #f3f4f6; color: #374151; }
        .kpi-row { margin-bottom: 16px; }
        .kpi-row table td { text-align: center; border: 1px solid #e5e7eb; padding: 8px; }
        .kpi-label { font-size: 9px; color: #6b7280; text-transform: uppercase; }
        .kpi-value { font-size: 18px; font-weight: bold; color: #065f46; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .page-break { page-break-after: always; }
        .info-grid { margin-bottom: 12px; }
        .info-grid td { border: none; padding: 3px 8px; }
        .info-grid .label { font-weight: bold; color: #6b7280; width: 140px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ICB CRM</h1>
        <div class="subtitle">@yield('title')</div>
        <div class="meta">Generated on {{ now()->format('d M Y, h:i A') }}</div>
        @hasSection('filters-meta')
            <div class="meta">@yield('filters-meta')</div>
        @endif
    </div>

    @yield('content')
</body>
</html>
