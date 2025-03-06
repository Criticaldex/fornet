import { NextRequest, NextResponse } from 'next/server';
import { SummaryIface } from '@/schemas/summary';

export async function GET(req: NextRequest) {
    // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const dbName = 'empresa2';
    const interval = 8;
    const turn = new Date().getHours()
    let timestamp = Math.floor(Date.now() - (interval * 60 * 60 * 1000));

    const fields = [
        "-_id"
    ];

    let summaries: SummaryIface[] = [];

    const sensors = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${dbName}`,
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(
                {
                    fields: fields,
                    filter: { read: true }
                }
            ),
        }).then(res => res.json());

    for (const sensor of sensors) {
        const filter = {
            "timestamp": { $gte: timestamp },
            "line": sensor.line,
            "name": sensor.name
        };

        const values = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${dbName}`,
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
                body: JSON.stringify(
                    {
                        fields: fields,
                        filter: filter,
                        sort: 'timestamp'
                    }
                ),
            }).then(res => res.json());

        if (values[0]) {
            let summary: SummaryIface = {
                line: values[0].line,
                plc_name: values[0].plc_name,
                name: values[0].name,
                unit: values[0].unit,
                max: values[0].value,
                min: values[0].value,
                avg: 0,
                year: new Date(timestamp).getFullYear(),
                month: new Date(timestamp).getMonth(),
                day: new Date(timestamp).getDate(),
                turn: turn,
            }
            for (const value of values) {
                if (value.value != undefined && summary.max != undefined && summary.min != undefined && summary.avg != undefined) {
                    summary.max = (value.value > summary.max) ? value.value : summary.max;
                    summary.min = (value.value < summary.min) ? value.value : summary.min;
                    summary.avg += value.value;
                }
            };
            summary.avg = (summary.avg) ? parseFloat((summary.avg / values.length).toFixed(2)) : 0;
            summaries.push(summary);
        }
    };
    const insert = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summaries/${dbName}`,
        {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(summaries)
        }).then(res => res.json());
    return NextResponse.json(insert);
}