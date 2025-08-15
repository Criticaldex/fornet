import { NextResponse } from 'next/server';
import { SummaryIface } from '@/schemas/summary';
import { empreses } from '@/app/constants';

export async function GET() {
    //if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
    //    console.log('ERROR: Bad Auth');
    //    return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
    //}

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            attempt++;
            console.log(`Beginning Cron!! (Attempt ${attempt}/${maxRetries})`);

            await executeCronLogic();

            console.log('Cron completed successfully!');
            return NextResponse.json('OK');

        } catch (error) {
            console.error(`Cron attempt ${attempt} failed:`, error);

            if (attempt === maxRetries) {
                console.error('All retry attempts failed');
                return NextResponse.json({ ERROR: `Cron failed after ${maxRetries} attempts: ${error}` }, { status: 500 });
            }

            console.log(`Retrying in attempt ${attempt + 1} after 4 minutes...`);
            await new Promise(resolve => setTimeout(resolve, 4 * 60 * 1000));
        }
    }
}

async function executeCronLogic() {

    const today = new Date();
    today.setDate(today.getDate() - 1);
    today.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setHours(0, 0, 0, 0);

    let timestampSummaries = today.getTime();
    let timestampDelete = yesterday.getTime();

    console.log('deleting old values...');
    for (const dbName of empreses) {
        const deleteValues = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${dbName}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
                body: JSON.stringify({
                    "timestamp": { $lt: timestampDelete }
                })
            }).then(res => res.json());
        console.log('Values deleted for', dbName);
    }

    const fields = [
        "-_id"
    ];

    console.log('fetching sensors...');
    for (const dbName of empreses) {
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

        if (!Array.isArray(sensors)) {
            console.error(`Invalid sensors data for ${dbName}:`, sensors);
            continue;
        }

        console.log(`Processing ${sensors.length} sensors for ${dbName}`);

        for (const sensor of sensors) {
            const filter = {
                "timestamp": { $lte: timestampSummaries },
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

            if (Array.isArray(values) && values.length > 0) {
                let summary: SummaryIface = {
                    line: values[0].line,
                    plc_name: values[0].plc_name,
                    name: values[0].name,
                    unit: values[0].unit,
                    max: values[0].value,
                    min: values[0].value,
                    avg: 0,
                    year: new Date(timestampSummaries).getFullYear(),
                    month: new Date(timestampSummaries).getMonth(),
                    day: new Date(timestampSummaries).getDate(),
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
        if (summaries.length > 0) {
            console.log(`Inserting ${summaries.length} summaries for ${dbName}...`);

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
                console.error(`Error inserting summaries for ${dbName}:`, insert.ERROR);
                throw new Error(`Failed to insert summaries for ${dbName}: ${insert.ERROR}`);
            }
            console.log(`Successfully inserted summaries for ${dbName}:`, insert);
        } else {
            console.log(`No summaries to insert for ${dbName}`);
        }
    }
}