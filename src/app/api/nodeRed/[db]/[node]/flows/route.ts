import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import PlcSchema, { PlcIface } from '@/schemas/plc'
import { NextResponse } from "next/server";
import { headers } from 'next/headers'

export async function GET(request: Request, { params }: { params: { db: string, node: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }

      const dbName = params.db;
      const node = params.node;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }

      const sensors = (await db.models.sensor.find().lean()) as SensorIface[];
      const plcs = (await db.models.plc.find({ node: node }).lean()) as PlcIface[];

      let nodes = [{
         "id": "7d940a1e580c0037",
         "type": "http request",
         "z": "e20161042794cb3d",
         "name": "",
         "method": "use",
         "ret": "txt",
         "paytoqs": "ignore",
         "url": `https://fornet.vercel.app/api/values/${dbName}`,
         "tls": "",
         "persist": false,
         "proxy": "",
         "insecureHTTPParser": false,
         "authType": "",
         "senderr": false,
         "headers": [
            {
               "keyType": "other",
               "keyValue": "token",
               "valueType": "other",
               "valueValue": process.env.NEXT_PUBLIC_API_KEY
            }
         ],
         "x": 590,
         "y": 160,
         "wires": [
            [
               "01db69f3eb88c693"
            ]
         ]
      },
      {
         "id": "01db69f3eb88c693",
         "type": "debug",
         "z": "e20161042794cb3d",
         "name": "debug 42",
         "active": true,
         "tosidebar": true,
         "console": false,
         "tostatus": false,
         "complete": "false",
         "statusVal": "",
         "statusType": "auto",
         "x": 740,
         "y": 160,
         "wires": []
      },
      {
         "id": "fb64f4acee62767d",
         "type": "mqtt-broker",
         "name": "broker",
         "broker": "broker.hivemq.com",
         "port": "1883",
         "clientid": "",
         "autoConnect": true,
         "usetls": false,
         "protocolVersion": "4",
         "keepalive": "60",
         "cleansession": true,
         "autoUnsubscribe": true,
         "birthTopic": "",
         "birthQos": "0",
         "birthRetain": "false",
         "birthPayload": "",
         "birthMsg": {},
         "closeTopic": "",
         "closeQos": "0",
         "closeRetain": "false",
         "closePayload": "",
         "closeMsg": {},
         "willTopic": "",
         "willQos": "0",
         "willRetain": "false",
         "willPayload": "",
         "willMsg": {},
         "userProps": "",
         "sessionExpiry": "",
         "credentials": {
            "user": "test",
            "password": "test"
         }
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
               "id": 'i' + sensor._id.toString(),
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
                     'f' + sensor._id.toString()
                  ]
               ]
            }

            const s7func: any = {
               "id": 'f' + sensor._id.toString(),
               "type": "function",
               "z": "e20161042794cb3d",
               "name": "Process",
               "func": `var da ={\n        \"line\": \"\",\n        \"plc_name\": \"\",\n        \"name\": \"\",\n        \"value\": \"\",\n        \"timestamp\": \"\"\n};\nda.plc_name = \"${sensor.plc_name}\";\nda.line = \"${sensor.line}\";\nda.value = msg.payload; \nda.timestamp = Date.now();\nda.name = \"${sensor.name}\";\nmsg.payload = da;\nmsg.method = 'PATCH';\nreturn msg;`,
               "outputs": 1,
               "timeout": 0,
               "noerr": 0,
               "initialize": "",
               "finalize": "",
               "libs": [],
               "x": 320,
               "y": y,
               "wires": [
                  [
                     "7d940a1e580c0037"
                  ]
               ]
            }

            nodes.push(s7in)
            nodes.push(s7func);

            const s7out: any = {
               "id": 'o' + sensor._id.toString(),
               "type": "s7 out",
               "z": "c6c280ebbc516f5b",
               "endpoint": endpoint,
               "variable": sensor.name,
               "name": sensor.name,
               "x": 1300,
               "y": y,
               "wires": []
            }
            nodes.push(s7out)

            const mqtt: any = {
               "id": 'm' + sensor._id.toString(),
               "type": "mqtt in",
               "z": "c6c280ebbc516f5b",
               "name": sensor.name,
               "topic": "fornet" + sensor._id.toString(),
               "qos": "2",
               "datatype": "utf8",
               "broker": "abf8899ee04d3094",
               "nl": false,
               "rap": true,
               "rh": 0,
               "inputs": 0,
               "x": 1000,
               "y": y,
               "wires": [
                  [
                     'o' + sensor._id.toString(),
                  ]
               ]
            }
            nodes.push(mqtt)

         }
      });

      return NextResponse.json(nodes);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}