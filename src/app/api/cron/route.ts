import { NextResponse } from 'next/server';
import { SummaryIface } from '@/schemas/summary';
import { headers } from 'next/headers';


export async function GET() {
    //if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
    //    console.log('ERROR: Bad Auth');
    //    return NextResponse.json({ ERROR: 'Bad Auth' });
    //}
    const dbName = 'empresa2';
    const interval = 24;
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
    if (insert.ERROR) {
        return NextResponse.json(insert, { status: 500 })
    }
    return NextResponse.json(insert);
}