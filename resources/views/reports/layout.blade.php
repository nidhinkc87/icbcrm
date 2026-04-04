<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title') - ICB CRM</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            color: #1f2937;
            line-height: 1.5;
            padding: 30px 40px;
            background: #fff;
        }

        /* ── Header ── */
        .report-header {
            text-align: center;
            padding-bottom: 16px;
            margin-bottom: 24px;
            border-bottom: 3px solid #065f46;
            position: relative;
        }
        .report-header::after {
            content: '';
            display: block;
            width: 100%;
            height: 1px;
            background: #a7f3d0;
            position: absolute;
            bottom: -6px;
            left: 0;
        }
        .report-header h1 {
            font-size: 22px;
            color: #065f46;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .report-header .subtitle {
            font-size: 14px;
            color: #374151;
            font-weight: 600;
            margin-top: 6px;
        }
        .report-header .meta {
            font-size: 9px;
            color: #9ca3af;
            margin-top: 6px;
            letter-spacing: 0.5px;
        }

        /* ── Section titles ── */
        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 22px 0 10px;
            padding: 6px 12px;
            background: #ecfdf5;
            border-left: 4px solid #065f46;
            border-radius: 0 4px 4px 0;
        }
        .section-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            margin: 16px 0 8px;
            padding-bottom: 4px;
            border-bottom: 1px dashed #d1d5db;
        }

        /* ── Data tables ── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            border-radius: 4px;
            overflow: hidden;
        }
        thead th {
            background: #065f46;
            color: #fff;
            padding: 8px 10px;
            text-align: left;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            border-bottom: 2px solid #047857;
        }
        tbody td {
            padding: 7px 10px;
            font-size: 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
        }
        tbody tr:nth-child(even) td { background: #f9fafb; }
        tbody tr:hover td { background: #f0fdf4; }
        tbody tr:last-child td { border-bottom: 2px solid #d1d5db; }

        /* ── Badges ── */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        .badge-gray { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }

        /* ── KPI cards ── */
        .kpi-row { margin: 12px 0 18px; }
        .kpi-row table { border: none; }
        .kpi-row table td {
            text-align: center;
            padding: 12px 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            vertical-align: middle;
        }
        .kpi-label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 600;
            margin-top: 4px;
        }
        .kpi-value {
            font-size: 20px;
            font-weight: 800;
            color: #065f46;
            line-height: 1.2;
        }
        .kpi-value.danger { color: #dc2626; }

        /* ── Info grid (detail rows) ── */
        .info-grid { margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
        .info-grid td { border: none; padding: 6px 12px; font-size: 10px; border-bottom: 1px solid #f3f4f6; }
        .info-grid tr:last-child td { border-bottom: none; }
        .info-grid .label { font-weight: 700; color: #6b7280; width: 130px; background: #f9fafb; }

        /* ── Summary footer ── */
        .summary-footer {
            margin-top: 12px;
            padding: 10px 14px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 10px;
            color: #4b5563;
        }
        .summary-footer strong { color: #065f46; }

        /* ── Employee name banner (performance report) ── */
        .employee-banner {
            font-size: 16px;
            font-weight: 800;
            color: #fff;
            background: #065f46;
            padding: 10px 16px;
            margin: 0 0 16px;
            border-radius: 6px;
            letter-spacing: 0.5px;
        }
        .employee-banner .dept {
            font-size: 10px;
            font-weight: 400;
            color: #a7f3d0;
            margin-left: 8px;
        }

        /* ── Collab stats row ── */
        .collab-row { margin: 10px 0 18px; }
        .collab-row table { border: none; }
        .collab-row table td {
            text-align: center;
            padding: 10px 10px;
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 6px;
        }
        .collab-value { font-size: 16px; font-weight: 800; color: #1e40af; }
        .collab-label { font-size: 8px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-top: 2px; }

        /* ── Utilities ── */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .page-break { page-break-after: always; }
        .mt-sm { margin-top: 8px; }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>ICB CRM</h1>
        <div class="subtitle">@yield('title')</div>
        <div class="meta">
            Generated on {{ now()->format('d M Y, h:i A') }}
            @hasSection('filters-meta')
                &nbsp;&bull;&nbsp; @yield('filters-meta')
            @endif
        </div>
    </div>

    @yield('content')
</body>
</html>
