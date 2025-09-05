import { NextResponse } from 'next/server';
import { SummaryIface } from '@/schemas/summary';
import { ShiftIface } from '@/schemas/shift';
import { empreses } from '@/app/constants';

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Calculate time range for a shift on a specific date
 * Handles overnight shifts that span midnight
 * @param date - The base date for the shift
 * @param shift - The shift configuration with startTime and endTime
 * @returns Object with start and end Date objects
 */
function getShiftTimeRange(date: Date, shift: ShiftIface): { start: Date; end: Date } {
    if (!shift.startTime || !shift.endTime) {
        throw new Error(`Invalid shift configuration: ${JSON.stringify(shift)}`);
    }

    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);

    // Validate time format
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        throw new Error(`Invalid time format in shift: ${shift.startTime} - ${shift.endTime}`);
    }

    const shiftStart = new Date(date);
    shiftStart.setHours(startHour, startMin, 0, 0);

    const shiftEnd = new Date(date);

    // Handle overnight shifts (end time is next day)
    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    shiftEnd.setHours(endHour, endMin, 0, 0);

    return { start: shiftStart, end: shiftEnd };
}

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
        // First, get list of incremental sensors
        const sensors = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${dbName}`,
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
                body: JSON.stringify({
                    fields: ['-_id', 'line', 'plc_name', 'autoinc'],
                    filter: { autoinc: true }
                })
            }).then(res => res.json());

        const incrementalSensors = sensors.filter((sensor: any) => sensor.autoinc);

        // Delete old values for all sensors
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

        // For incremental sensors, add a 0 value at yesterday's timestamp
        for (const sensor of incrementalSensors) {
            const zeroValue = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${dbName}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json',
                        token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                    },
                    body: JSON.stringify({
                        line: sensor.line,
                        plc_name: sensor.plc_name,
                        value: 0,
                        timestamp: timestampDelete
                    })
                }).then(res => res.json());
            console.log(`Zero value added for incremental sensor ${sensor.line}/${sensor.plc_name} in ${dbName}`);
        }

        console.log('Values deleted for', dbName, `- ${incrementalSensors.length} incremental sensors reset to 0`);
    }

    const fields = [
        "-_id"
    ];

    console.log('Fetching shifts and sensors for all databases...');
    for (const dbName of empreses) {
        console.log(`\n=== Processing database: ${dbName} ===`);

        // Fetch shifts for this database
        const shifts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${dbName}`,
            {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                }
            }).then(res => res.json()).catch(err => {
                console.error(`Error fetching shifts for ${dbName}:`, err);
                return [];
            });

        if (!Array.isArray(shifts) || shifts.length === 0) {
            console.warn(`⚠️  No shifts configured for ${dbName}, skipping database...`);
            continue;
        }

        console.log(`✅ Found ${shifts.length} shifts for ${dbName}:`, shifts.map(s => `${s.name} (${s.startTime}-${s.endTime})`).join(', '));

        // Fetch sensors once per database
        let allSummaries: SummaryIface[] = [];
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
            }).then(res => res.json()).catch(err => {
                console.error(`Error fetching sensors for ${dbName}:`, err);
                return [];
            });

        if (!Array.isArray(sensors) || sensors.length === 0) {
            console.warn(`⚠️  No sensors found for ${dbName}, skipping database...`);
            continue;
        }

        console.log(`✅ Found ${sensors.length} sensors to process for ${dbName}`);

        // Process each shift separately
        let processedShifts = 0;
        let totalSummaries = 0;

        for (const shift of shifts) {
            if (!shift.name || !shift.startTime || !shift.endTime) {
                console.warn(`⚠️  Skipping invalid shift configuration for ${dbName}:`, shift);
                continue;
            }

            console.log(`\n--- Processing shift: ${shift.name} (${shift.startTime} - ${shift.endTime}) ---`);

            try {
                // Get time range for this shift on the target date
                const shiftTimeRange = getShiftTimeRange(yesterday, shift);
                console.log(`   Time range: ${shiftTimeRange.start.toISOString()} to ${shiftTimeRange.end.toISOString()}`);

                let shiftSummaries = 0;

                for (const sensor of sensors) {
                    if (!sensor.line || !sensor.name) {
                        console.warn(`   ⚠️  Skipping invalid sensor:`, sensor);
                        continue;
                    }

                    const filter = {
                        "timestamp": {
                            $gte: shiftTimeRange.start.getTime(),
                            $lt: shiftTimeRange.end.getTime()
                        },
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
                        }).then(res => res.json()).catch(err => {
                            console.warn(`   ⚠️  Error fetching values for sensor ${sensor.name}:`, err.message);
                            return [];
                        });

                    if (Array.isArray(values) && values.length > 0) {
                        let summary: SummaryIface = {
                            line: values[0].line,
                            plc_name: values[0].plc_name,
                            name: values[0].name,
                            unit: values[0].unit,
                            max: values[0].value,
                            min: values[0].value,
                            avg: 0,
                            shift: shift.name,
                            year: yesterday.getFullYear(),
                            month: yesterday.getMonth(),
                            day: yesterday.getDate(),
                        }

                        for (const value of values) {
                            if (value.value != undefined && summary.max != undefined && summary.min != undefined && summary.avg != undefined) {
                                summary.max = (value.value > summary.max) ? value.value : summary.max;
                                summary.min = (value.value < summary.min) ? value.value : summary.min;
                                summary.avg += value.value;
                            }
                        };
                        summary.avg = (summary.avg) ? parseFloat((summary.avg / values.length).toFixed(2)) : 0;
                        allSummaries.push(summary);
                        shiftSummaries++;
                    }
                }

                console.log(`   ✅ Created ${shiftSummaries} summaries for shift ${shift.name}`);
                totalSummaries += shiftSummaries;
                processedShifts++;

            } catch (shiftError) {
                console.error(`❌ Error processing shift ${shift.name} for ${dbName}:`, shiftError);
                // Continue with next shift instead of failing completely
            }
        }

        console.log(`\n📊 Summary for ${dbName}: Processed ${processedShifts}/${shifts.length} shifts, created ${totalSummaries} summaries`);

        if (allSummaries.length > 0) {
            console.log(`💾 Inserting ${allSummaries.length} summaries for ${dbName}...`);

            const insert = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summaries/${dbName}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json',
                        token: `${process.env.NEXT_PUBLIC_API_KEY}`,
                    },
                    body: JSON.stringify(allSummaries)
                }).then(res => res.json()).catch(err => {
                    console.error(`❌ Error inserting summaries for ${dbName}:`, err);
                    throw new Error(`Failed to insert summaries for ${dbName}: ${err.message}`);
                });

            if (insert.ERROR) {
                console.error(`❌ API Error inserting summaries for ${dbName}:`, insert.ERROR);
                throw new Error(`Failed to insert summaries for ${dbName}: ${insert.ERROR}`);
            }
            console.log(`✅ Successfully inserted ${allSummaries.length} summaries for ${dbName}`);
        } else {
            console.log(`ℹ️  No summaries to insert for ${dbName}`);
        }
    }
}