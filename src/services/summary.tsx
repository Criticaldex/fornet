import cron from 'node-cron'
import _ from "lodash"
import { getSession } from "@/services/session"
import { ValueIface } from "@/schemas/value";
import { SensorIface } from "@/schemas/sensor";
import { SummaryIface } from '@/schemas/summary';

export const createSummary = async () => {
    const dbName = 'empresa2';
    const interval = 8;
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
                turn: 1,
            }
            for (const value of values) {
                if (value.value != undefined && summary.max != undefined && summary.min != undefined && summary.avg != undefined) {
                    summary.max = (value.value > summary.max) ? value.value : summary.max;
                    summary.min = (value.value < summary.min) ? value.value : summary.min;
                    summary.avg += value.value;
                }
            };
            summary.avg = (summary.avg) ? (summary.avg / values.length) : 0;
            summaries.push(summary);
        }
    };
    console.log('summaries: ', summaries)
}