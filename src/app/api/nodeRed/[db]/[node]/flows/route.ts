import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import _ from "lodash"
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
      const sensorByName = _.groupBy(sensors, 'plc_name');

      let nodes = [
         {
            "id": "e48de9f0bc1f4a1a",
            "type": "mongodb4-client",
            "z": "c6c280ebbc516f5b",
            "name": "",
            "protocol": "mongodb",
            "hostname": `${process.env.MONGO_USER}:${process.env.MONGO_PASS}@79.137.39.132:27017/?authSource=admin&authMechanism=SCRAM-SHA-256`,
            "port": "",
            "dbName": dbName,
            "appName": "",
            "authSource": "",
            "authMechanism": "DEFAULT",
            "tls": false,
            "tlsCAFile": "",
            "tlsCertificateKeyFile": "",
            "tlsInsecure": false,
            "connectTimeoutMS": "30000",
            "socketTimeoutMS": "0",
            "minPoolSize": "0",
            "maxPoolSize": "100",
            "maxIdleTimeMS": "0",
            "uri": "",
            "advanced": "{}",
            "uriTabActive": "tab-uri-simple"
         },
         {
            "id": "ee5456395837bb6f",
            "type": "mongodb4",
            "z": "c6c280ebbc516f5b",
            "clientNode": "e48de9f0bc1f4a1a",
            "mode": "collection",
            "collection": "values",
            "operation": "insertOne",
            "output": "toArray",
            "maxTimeMS": "0",
            "handleDocId": false,
            "name": "ForNet",
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
            "id": "d8848f83c2ef4443",
            "type": "mqtt-broker",
            "name": "MQTT fornet",
            "broker": process.env.MQTT_BROKER,
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
               "user": process.env.MQTT_USER,
               "password": process.env.MQTT_PASS
            }
         }
      ];

      let y = 100;
      plcs.forEach(plc => {
         switch (plc.type) {
            case 'siemens':
               let vartables: any = [];
               sensorByName[plc.name].forEach(sensor => {
                  if (sensor.line == plc.line) {
                     vartables.push({
                        "addr": sensor.address,
                        "name": sensor.name
                     })
                  }
               })
               const endpoint: any = {
                  "id": plc._id.toString(),
                  "type": "s7 endpoint",
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

               sensorByName[plc.name].forEach(sensor => {
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {
                        //let endpoint;
                        // let read;
                        // for (let i = 0; i < plcs.length; i++) {
                        //    if (sensor.line == plcs[i].line && sensor.plc_name == plcs[i].name && plcs[i].node == node) {
                        //       endpoint = plcs[i]._id.toString();
                        //       read = true;
                        //       y = y + 50;
                        //       break;
                        //    }
                        // }

                        //read
                        const s7in: any = {
                           "id": 'i' + sensor._id.toString(),
                           "type": "s7 in",
                           "z": "0116f42dcdc8f6bb",
                           "endpoint": plc._id.toString(),
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
                        //read
                        const s7func: any = {
                           "id": 'f' + sensor._id.toString(),
                           "type": "function",
                           "z": "e20161042794cb3d",
                           "name": "Process",
                           "func": `var da ={\n        \"line\": \"\",\n        \"plc_name\": \"\",\n        \"name\": \"\",\n        \"value\": \"\",\n        \"timestamp\": \"\"\n};\nda.plc_name = \"${sensor.plc_name}\";\nda.line = \"${sensor.line}\";\nda.value = msg.payload; \nda.timestamp = Date.now();\nda.name = \"${sensor.name}\";\nmsg.payload = [da];\nmsg.method = 'PATCH';\nreturn msg;`,
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
                                 "ee5456395837bb6f"
                              ]
                           ]
                        }
                        nodes.push(s7in)
                        nodes.push(s7func);

                     }
                     if (sensor.write) {
                        let endpoint;
                        // let write;
                        // for (let i = 0; i < plcs.length; i++) {
                        //    if (sensor.line == plcs[i].line && sensor.plc_name == plcs[i].name && plcs[i].node == node) {
                        //       endpoint = plcs[i]._id.toString();
                        //       write = true;
                        //       y = y + 50;
                        //       break;
                        //    }
                        // }
                        //write
                        const s7out: any = {
                           "id": 'o' + sensor._id.toString(),
                           "type": "s7 out",
                           "z": "c6c280ebbc516f5b",
                           "endpoint": plc._id.toString(),
                           "variable": sensor.name,
                           "name": sensor.name,
                           "x": 1300,
                           "y": y,
                           "wires": []
                        }
                        nodes.push(s7out)
                        //write
                        const mqtt: any = {
                           "id": 'm' + sensor._id.toString(),
                           "type": "mqtt in",
                           "z": "c6c280ebbc516f5b",
                           "name": sensor.name,
                           "topic": "fornet" + sensor._id.toString(),
                           "qos": "2",
                           "datatype": "utf8",
                           "broker": "d8848f83c2ef4443",
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
                     y = y + 50;
                  }
               }
               );
               break;
            case 'modbus':
               const endpoint_modbus: any = {
                  "id": plc._id.toString(),
                  "type": "modbus-client",
                  "name": "PLC SCHNEIDER",
                  "clienttype": "tcp",
                  "bufferCommands": true,
                  "stateLogEnabled": false,
                  "queueLogEnabled": false,
                  "failureLogEnabled": true,
                  "tcpHost": plc.ip,
                  "tcpPort": "502",
                  "tcpType": "DEFAULT",
                  "serialPort": "/dev/ttyUSB",
                  "serialType": "RTU-BUFFERD",
                  "serialBaudrate": "9600",
                  "serialDatabits": "8",
                  "serialStopbits": "1",
                  "serialParity": "none",
                  "serialConnectionDelay": "100",
                  "serialAsciiResponseStartDelimiter": "0x3A",
                  "unit_id": "1",
                  "commandDelay": "1",
                  "clientTimeout": "1000",
                  "reconnectOnTimeout": true,
                  "reconnectTimeout": "2000",
                  "parallelUnitIdsAllowed": true,
                  "showWarnings": true,
                  "showLogs": true
               }
               nodes.push(endpoint_modbus)

               sensorByName[plc.name].forEach(sensor => {
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {
                        let endpoint;
                        // let read;
                        // for (let i = 0; i < plcs.length; i++) {
                        //    if (sensor.line == plcs[i].line && sensor.plc_name == plcs[i].name && plcs[i].node == node) {
                        //       endpoint = plcs[i]._id.toString();
                        //       read = true;
                        //       y = y + 50;
                        //       break;
                        //    }
                        // }
                        //read
                        const modbus_read: any = {
                           "id": "e191115593eeeef7",
                           "type": "modbus-read",
                           "z": "67e50ff7c3bb3610",
                           "name": "",
                           "topic": "",
                           "showStatusActivities": false,
                           "logIOActivities": false,
                           "showErrors": false,
                           "showWarnings": true,
                           "unitid": "",
                           "dataType": sensor.dataType,
                           "adr": sensor.address,
                           "quantity": "1",
                           "rate": "1",
                           "rateUnit": "s",
                           "delayOnStart": false,
                           "startDelayTime": "",
                           "server": plc._id.toString(),
                           "useIOFile": false,
                           "ioFile": "",
                           "useIOForPayload": false,
                           "emptyMsgOnFail": false,
                           "x": 180,
                           "y": y,
                           "wires": [
                              [],
                              [
                                 "d1a8e2e7cffbe85b"
                              ]
                           ]
                        }
                        //read
                        const modbus_func: any = {
                           "id": "d1a8e2e7cffbe85b",
                           "type": "function",
                           "z": "67e50ff7c3bb3610",
                           "name": "function 1",
                           "func": "var da = {\n    \"line\": \"\",\n    \"plc_name\": \"\",\n    \"name\": \"\",\n    \"value\": \"\",\n    \"timestamp\": \"\"\n};\nda.plc_name = \"lubricadora schn\";\nda.line = \"Random\";\nda.value = msg.payload.buffer[0];\nda.timestamp = Date.now();\nda.name = \"PiezaNOK\";\nmsg.payload = [da];\nmsg.method = 'PATCH';\nreturn msg;",
                           "outputs": 1,
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 320,
                           "y": y,
                           "wires": [
                              [
                                 "ee5456395837bb6f"
                              ]
                           ]
                        }
                        nodes.push(modbus_read)
                        nodes.push(modbus_func);
                     }
                     if (sensor.write) {
                        const modbus_out: any = {
                           "id": 'm' + sensor._id.toString(),
                           "type": "mqtt in",
                           "z": "c6c280ebbc516f5b",
                           "name": sensor.name,
                           "topic": "fornet" + sensor._id.toString(),
                           "qos": "2",
                           "datatype": "utf8",
                           "broker": "d8848f83c2ef4443",
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
                        nodes.push(modbus_out)
                        //write
                        const mqtt: any = {
                           "id": 'o' + sensor._id.toString(),
                           "type": "modbus-write",
                           "z": "67e50ff7c3bb3610",
                           "name": "",
                           "showStatusActivities": false,
                           "showErrors": false,
                           "showWarnings": true,
                           "unitid": "",
                           "dataType": sensor.dataType,
                           "adr": sensor.address,
                           "quantity": "1",
                           "server": plc._id.toString(),
                           "emptyMsgOnFail": false,
                           "keepMsgProperties": false,
                           "delayOnStart": false,
                           "startDelayTime": "",
                           "x": 1300,
                           "y": y,
                           "wires": [
                              [],
                              []
                           ]
                        }
                        nodes.push(mqtt)
                     }
                     y = y + 50;
                  }
               }
               );
               break;
            case 'omron':
               const FinsConn: any = {
                  "id": plc._id.toString(),
                  "type": "FINS Connection",
                  "name": plc.name, //igual es la ID
                  "host": plc.ip,
                  "port": "9600",
                  "MODE": "",
                  "MODEType": "CP",
                  "protocol": "",
                  "protocolType": "tcp",
                  "ICF": "0x80",
                  "DNA": "0",
                  "DA1": plc.ip.split(".")[3],
                  "DA2": "0",
                  "SNA": "0",
                  "SA1": plc.node.split(".")[3],
                  "SA2": "0",
                  "autoConnect": true
               }
               nodes.push(FinsConn);

               sensorByName[plc.name].forEach(sensor => {
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {

                        const FinsRead: any = {
                           "id": 'or' + sensor._id.toString(),
                           "type": "FINS Read",
                           "z": "dd8ce168801a13c1",
                           "name": sensor.name,
                           "connection": plc._id.toString(),
                           "addressType": "str",
                           "address": sensor.address,
                           "countType": "num",
                           "count": 1,
                           "msgPropertyType": "msg",
                           "msgProperty": "payload",
                           "outputFormatType": "unsignedkv",
                           "outputFormat": "",
                           "x": 180,
                           "y": y,
                           "wires": [
                              [
                                 'ofr' + sensor._id.toString()
                              ]
                           ]
                        }

                        const FinsFunc: any = {
                           "id": 'ofr' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Process",
                           "func": "var da ={\n        \"line\": \"\",\n        \"plc_name\": \"\",\n        \"name\": \"\",\n        \"value\": \"\",\n        \"timestamp\": \"\"\n};\nda.plc_name = \"lubricadora\";\nda.line = \"Random\";\nda.value = msg.payload; \nda.timestamp = Date.now();\nda.name = \"Temperatura\";\nmsg.payload = [da];\nmsg.method = 'PATCH';\nreturn msg;",
                           "outputs": 1,
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 320,
                           "y": y,
                           "wires": [
                              [
                                 "ee5456395837bb6f"
                              ]
                           ]
                        }

                        nodes.push(FinsRead)
                        nodes.push(FinsFunc);

                     }
                     if (sensor.write) {
                        //write
                        const finsWrite: any = {
                           "id": 'ofw' + sensor._id.toString(),
                           "type": "FINS Write",
                           "z": "dd8ce168801a13c1",
                           "name": sensor.name,
                           "connection": plc._id.toString(),
                           "addressType": "msg",
                           "address": sensor.address,
                           "dataType": "msg",
                           "data": "payload",
                           "msgPropertyType": "str",
                           "msgProperty": "payload",
                           "x": 1300,
                           "y": y,
                           "wires": []
                        }

                        const OmronMqttIn: any = {
                           "id": 'ofmqtt' + sensor._id.toString(),
                           "type": "mqtt in",
                           "z": "dd8ce168801a13c1",
                           "name": sensor.name,
                           "topic": "fornet" + sensor._id.toString(),
                           "datatype": "utf8",
                           "broker": "d8848f83c2ef4443",
                           "nl": false,
                           "rap": true,
                           "rh": 0,
                           "inputs": 0,
                           "x": 1000,
                           "y": y,
                           "wires": [
                              [
                                 'ofw' + sensor._id.toString(),
                              ]
                           ]
                        }

                        nodes.push(finsWrite);
                        nodes.push(OmronMqttIn);
                     }
                     y = y + 50;
                  }
               }
               );
               break;
            default:
               break;
         }
      });
      return NextResponse.json(nodes);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}