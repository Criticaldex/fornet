import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import PlcSchema, { PlcIface } from '@/schemas/plc'
import { NextResponse } from "next/server";
import { headers } from 'next/headers'

export async function GET(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' });
        }

        const dbName = params.db;
        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.sensor) {
            db.model('sensor', SensorSchema);
        }

        if (!db.models.plc) {
            db.model('plc', PlcSchema);
        }

        const sensors = (await db.models.sensor.find().lean()) as SensorIface[];
        const plcs = (await db.models.plc.find().lean()) as PlcIface[];

        let nodes = [{
            "id": "bc9da5834aeee189",
            "type": "mongodb3",
            "uri": `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@fornetcluster.mcjjyoo.mongodb.net/${dbName}`,
            "name": dbName,
            "options": "",
            "parallelism": "-1"
        }, {
            "id": "e530bfef3dcdb002",
            "type": "mongodb3 in",
            "z": "0116f42dcdc8f6bb",
            "service": "_ext_",
            "configNode": "bc9da5834aeee189",
            "name": "Fornet",
            "collection": "values",
            "operation": "insertOne",
            "x": 610,
            "y": 160,
            "wires": [
                []
            ]
        },
        {
            "id": "d1a8bab8d18fa9ad",
            "type": "function",
            "z": "0116f42dcdc8f6bb",
            "name": "Process",
            "func": "var nodes = msg.payload;  \nvar da = {\n    \"id\": \"c6c280ebbc516f5b\",\n    \"label\": \"Fornet\",\n    \"disabled\": false,\n    \"info\": \"\",\n    \"env\": [],\n    \"nodes\": nodes.nodes\n}\nmsg.payload = da;\n// msg.payload = nodes.nodes;\nreturn msg;",
            "outputs": 2,
            "timeout": 0,
            "noerr": 0,
            "initialize": "",
            "finalize": "",
            "libs": [],
            "x": 400,
            "y": 140,
            "wires": [
                [
                    "e530bfef3dcdb002"
                ]
            ]
        }
        ]

        plcs.forEach(plc => {
            let vartables: any = [];
            sensors.forEach(sensor => {
                if (sensor.line == plc.line && sensor.plc_name == plc.name) {
                    vartables.push({
                        "addr": sensor.address,
                        "name": sensor.name
                    })
                }
            })
            const endpoint: any = {
                "id": plc._id.toString(),
                "type": plc.type,
                "transport": "iso-on-tcp",
                "address": plc.ip,
                "port": "102",
                "rack": "0",
                "slot": "1",
                "localtsaphi": "01",
                "localtsaplo": "00",
                "remotetsaphi": "01",
                "remotetsaplo": "00",
                "connmode": "rack-slot",
                "adapter": "",
                "busaddr": "2",
                "cycletime": "1000",
                "timeout": "2000",
                "name": plc.name,
                "vartable": vartables
            }
            nodes.push(endpoint)
        });

        let y = 100;
        sensors.forEach(sensor => {
            if (sensor.active) {
                y = y + 50;
                let endpoint;
                for (let i = 0; i < plcs.length; i++) {
                    if (sensor.line == plcs[i].line && sensor.plc_name == plcs[i].name) {
                        endpoint = plcs[i]._id.toString();
                        break;
                    }
                }

                const s7in: any = {
                    "id": sensor._id.toString(),
                    "type": "s7 in",
                    "z": "0116f42dcdc8f6bb",
                    "endpoint": endpoint,
                    "mode": "single",
                    "variable": sensor.name,
                    "diff": true,
                    "name": sensor.name,
                    "x": 180,
                    "y": y,
                    "wires": [
                        [
                            "d1a8bab8d18fa9ad"
                        ]
                    ]
                }
                nodes.push(s7in)
            }
        });

        return NextResponse.json(nodes);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message });
    }
}