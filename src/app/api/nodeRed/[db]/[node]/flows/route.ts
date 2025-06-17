import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import _ from "lodash"
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import PlcSchema, { PlcIface } from '@/schemas/plc'
import { NextResponse } from "next/server";
import { headers } from 'next/headers'

export async function GET(request: Request, { params }: { params: { db: string, node: string } }) {
   //Gerard, s'ha de validar que el plc te sensors, y qu ela línea te plc, si no al fer el foreach peta la request
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
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
            "x": 690,
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
         },
         {
            "id": "7520a9122b3626a9",
            "type": "telegram bot",
            "botname": "Fornet_gle",
            "token": process.env.TELEGRAM_BOT_TOKEN,
            "usernames": "",
            "chatids": "",
            "baseapiurl": "",
            "updatemode": "polling",
            "pollinterval": "300",
            "usesocks": false,
            "sockshost": "",
            "socksport": "6667",
            "socksusername": "anonymous",
            "sockspassword": "",
            "bothost": "",
            "botpath": "",
            "localbotport": "8443",
            "publicbotport": "8443",
            "privatekey": "",
            "certificate": "",
            "useselfsignedcertificate": false,
            "sslterminated": false,
            "verboselogging": false
         },
         {
            "id": "6c06b6c6dc43c887",
            "type": "telegram sender",
            "z": "c6c280ebbc516f5b",
            "name": "",
            "bot": "7520a9122b3626a9",
            "haserroroutput": false,
            "outputs": 1,
            "x": 690,
            "y": 250,
            "wires": [
               []
            ]
         },
         {
            "id": "98f0503cc1ef7d51",
            "type": "e-mail",
            "z": "c6c280ebbc516f5b",
            "server": "smtp.gmail.com",
            "port": "465",
            "secure": true,
            "tls": true,
            "userid": process.env.MAIL_FORNET,
            "password": process.env.API_TOKEN_MAIL,
            "name": "",
            "dname": "",
            "x": 690,
            "y": 300,
            "wires": []
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
                                 'f' + sensor._id.toString(),
                                 's' + sensor._id.toString()
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
                        const s7Switch: any = {
                           "id": 's' + sensor._id.toString(),
                           "type": "switch",
                           "z": "c6c280ebbc516f5b",
                           "name": "",
                           "property": "payload",
                           "propertyType": "msg",
                           "rules": [
                              {
                                 "t": "gte",
                                 "v": "1300",         // GERARD AÑADIR AQUI RANGO MAXIMO SENSOR
                                 "vt": "num"
                              },
                              {
                                 "t": "lte",
                                 "v": "100",          // GERARD AÑADIR AQUI RANGO MINIMO SENSOR
                                 "vt": "num"
                              }
                           ],
                           "checkall": "true",
                           "repair": false,
                           "outputs": 2,
                           "x": 320,
                           "y": y + 50,
                           "wires": [
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ],
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ]
                           ]
                        };
                        const s7ProcesTelegram: any = {
                           "id": 't' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Process",
                           "func": `let value = msg.payload;\n\nmsg.payload = {\n    content: "🚨 LIMITE SUPERADO\\n Línea: ${sensor.line}\\nPLC: ${sensor.plc_name}\\nValue: ` + "${value}" + `",\n    chatId: ${process.env.CHAT_ID_TELEGRAM},\n    type: \"message\"\n};\n\nreturn msg;`,
                           "outputs": 1,
                           "timeout": 0,
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 370,
                           "y": y + 50,
                           "wires": [
                              [
                                 "6c06b6c6dc43c887"
                              ]
                           ]
                        }
                        const s7Processhtml: any = {
                           "id": 'm' + sensor._id.toString(),
                           "type": "template",
                           "z": "c6c280ebbc516f5b",
                           "name": "html",
                           "field": "body",
                           "fieldType": "msg",
                           "format": "handlebars",
                           "syntax": "mustache",
                           "template": `<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <style>\n        /* Reset básico */\n        body, p, div {\n            margin: 0;\n            padding: 0;\n        }\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            background-color: #121212;\n            color: #e0e0e0;\n            -webkit-font-smoothing: antialiased;\n            -moz-osx-font-smoothing: grayscale;\n            line-height: 1.6;\n        }\n        .container {\n            max-width: 600px;\n            background-color: #1e1e1e;\n            margin: 40px auto;\n            border-radius: 8px;\n            padding: 30px 40px;\n            box-shadow: 0 8px 20px rgba(243,111,33,0.3);\n            border: 2px solid #f36f21;\n        }\n        .logo {\n            text-align: center;\n            margin-bottom: 30px;\n        }\n        .logo img {\n            width: 160px;\n            height: auto;\n            filter: brightness(0) invert(1); /* para logos negros que quieras invertir */\n        }\n        .alert-header {\n            font-size: 26px;\n            font-weight: 700;\n            color: #f36f21;\n            text-align: center;\n            margin-bottom: 25px;\n            letter-spacing: 1px;\n        }\n        .alert-box {\n            background-color: #2c2c2c;\n            border-left: 6px solid #f36f21;\n            padding: 25px 30px;\n            border-radius: 6px;\n            font-size: 18px;\n            color: #ddd;\n        }\n        .alert-box strong {\n            color: #f36f21;\n        }\n        .alert-box span {\n            color: #ff4c00;\n            font-weight: 700;\n        }\n        .footer {\n            text-align: center;\n            font-size: 14px;\n            color: #999999;\n            margin-top: 40px;\n            font-style: italic;\n        }\n        a {\n            color: #f36f21;\n            text-decoration: none;\n        }\n        /* Responsivo */\n        @media only screen and (max-width: 620px) {\n            .container {\n                margin: 20px 15px;\n                padding: 20px;\n            }\n            .alert-header {\n                font-size: 22px;\n            }\n            .alert-box {\n                font-size: 16px;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"logo\">\n            <img src=\"https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png\" alt=\"Fornet Logo\" />\n        </div>\n\n        <div class=\"alert-header\">🚨 Alerta de sistema detectada</div>\n\n        <div class=\"alert-box\">\n            Límite superado<br />\n            <strong>PLC:</strong> ${sensor.plc_name}<br />\n            <strong>Sensor:</strong> ${sensor.name}<br />\n            <strong>Valor:</strong> <span>` + "${msg.payload}" + `</span>\n        </div>\n\n        <div class=\"footer\">\n            Esta alerta ha sido generada automáticamente por <strong>Fornet</strong>.\n        </div>\n    </div>\n</body>\n</html>\n`,
                           "x": 370,
                           "y": y + 100,
                           "wires": [
                              [
                                 'pm' + sensor._id.toString()
                              ]
                           ]
                        }
                        const s7ProcessMail: any = {
                           "id": 'pm' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Transactional Emails",
                           "func": `let resultado = msg.body.replace` + "(\"${msg.payload}\", " + `msg.payload);\nmsg={\n    payload:resultado,\n    topic:\"FORNET Alerta Línea ${sensor.line}\",\n    to: \"fornetgle@gmail.com, ll.valls.v@gmail.com, induvalls@gmail.com\"\n   \n};\n\n\nreturn msg;`,     // GERARD AÑADIR AQUI MAILS SEPARADOS POR COMA COMO EN EL EJEMPLO
                           "outputs": 1,
                           "timeout": "",
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 420,
                           "y": y + 100,
                           "wires": [
                              [
                                 "98f0503cc1ef7d51"
                              ]
                           ]
                        }
                        nodes.push(s7in);
                        nodes.push(s7Switch);
                        nodes.push(s7ProcesTelegram);
                        nodes.push(s7Processhtml);
                        nodes.push(s7ProcessMail);
                        nodes.push(s7func);
                     }
                     if (sensor.write) {
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
                     y = y + 200;
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
                                 "d1a8e2e7cffbe85b",
                                 's' + sensor._id.toString()
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
                        const modbus_Switch: any = {
                           "id": 's' + sensor._id.toString(),
                           "type": "switch",
                           "z": "c6c280ebbc516f5b",
                           "name": "",
                           "property": "payload",
                           "propertyType": "msg",
                           "rules": [
                              {
                                 "t": "gte",
                                 "v": "1300",         // GERARD AÑADIR AQUI RANGO MAXIMO SENSOR
                                 "vt": "num"
                              },
                              {
                                 "t": "lte",
                                 "v": "100",          // GERARD AÑADIR AQUI RANGO MINIMO SENSOR
                                 "vt": "num"
                              }
                           ],
                           "checkall": "true",
                           "repair": false,
                           "outputs": 2,
                           "x": 320,
                           "y": y + 50,
                           "wires": [
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ],
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ]
                           ]
                        };
                        const modbus_ProcesTelegram: any = {
                           "id": 't' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Process",
                           "func": `let value = msg.payload;\n\nmsg.payload = {\n    content: "🚨 LIMITE SUPERADO\\n Línea: ${sensor.line}\\nPLC: ${sensor.plc_name}\\nValue: ` + "${value}" + `",\n    chatId: ${process.env.CHAT_ID_TELEGRAM},\n    type: \"message\"\n};\n\nreturn msg;`,
                           "outputs": 1,
                           "timeout": 0,
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 370,
                           "y": y + 50,
                           "wires": [
                              [
                                 "6c06b6c6dc43c887"
                              ]
                           ]
                        }
                        const modbus_Processhtml: any = {
                           "id": 'm' + sensor._id.toString(),
                           "type": "template",
                           "z": "c6c280ebbc516f5b",
                           "name": "html",
                           "field": "body",
                           "fieldType": "msg",
                           "format": "handlebars",
                           "syntax": "mustache",
                           "template": `<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <style>\n        /* Reset básico */\n        body, p, div {\n            margin: 0;\n            padding: 0;\n        }\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            background-color: #121212;\n            color: #e0e0e0;\n            -webkit-font-smoothing: antialiased;\n            -moz-osx-font-smoothing: grayscale;\n            line-height: 1.6;\n        }\n        .container {\n            max-width: 600px;\n            background-color: #1e1e1e;\n            margin: 40px auto;\n            border-radius: 8px;\n            padding: 30px 40px;\n            box-shadow: 0 8px 20px rgba(243,111,33,0.3);\n            border: 2px solid #f36f21;\n        }\n        .logo {\n            text-align: center;\n            margin-bottom: 30px;\n        }\n        .logo img {\n            width: 160px;\n            height: auto;\n            filter: brightness(0) invert(1); /* para logos negros que quieras invertir */\n        }\n        .alert-header {\n            font-size: 26px;\n            font-weight: 700;\n            color: #f36f21;\n            text-align: center;\n            margin-bottom: 25px;\n            letter-spacing: 1px;\n        }\n        .alert-box {\n            background-color: #2c2c2c;\n            border-left: 6px solid #f36f21;\n            padding: 25px 30px;\n            border-radius: 6px;\n            font-size: 18px;\n            color: #ddd;\n        }\n        .alert-box strong {\n            color: #f36f21;\n        }\n        .alert-box span {\n            color: #ff4c00;\n            font-weight: 700;\n        }\n        .footer {\n            text-align: center;\n            font-size: 14px;\n            color: #999999;\n            margin-top: 40px;\n            font-style: italic;\n        }\n        a {\n            color: #f36f21;\n            text-decoration: none;\n        }\n        /* Responsivo */\n        @media only screen and (max-width: 620px) {\n            .container {\n                margin: 20px 15px;\n                padding: 20px;\n            }\n            .alert-header {\n                font-size: 22px;\n            }\n            .alert-box {\n                font-size: 16px;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"logo\">\n            <img src=\"https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png\" alt=\"Fornet Logo\" />\n        </div>\n\n        <div class=\"alert-header\">🚨 Alerta de sistema detectada</div>\n\n        <div class=\"alert-box\">\n            Límite superado<br />\n            <strong>PLC:</strong> ${sensor.plc_name}<br />\n            <strong>Sensor:</strong> ${sensor.name}<br />\n            <strong>Valor:</strong> <span>` + "${msg.payload}" + `</span>\n        </div>\n\n        <div class=\"footer\">\n            Esta alerta ha sido generada automáticamente por <strong>Fornet</strong>.\n        </div>\n    </div>\n</body>\n</html>\n`,
                           "x": 370,
                           "y": y + 100,
                           "wires": [
                              [
                                 'pm' + sensor._id.toString()
                              ]
                           ]
                        }
                        const modbus_ProcessMail: any = {
                           "id": 'pm' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Transactional Emails",
                           "func": `let resultado = msg.body.replace` + "(\"${msg.payload}\", " + `msg.payload);\nmsg={\n    payload:resultado,\n    topic:\"FORNET Alerta Línea ${sensor.line}\",\n    to: \"fornetgle@gmail.com, ll.valls.v@gmail.com, induvalls@gmail.com\"\n   \n};\n\n\nreturn msg;`,     // GERARD AÑADIR AQUI MAILS SEPARADOS POR COMA COMO EN EL EJEMPLO
                           "outputs": 1,
                           "timeout": "",
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 420,
                           "y": y + 100,
                           "wires": [
                              [
                                 "98f0503cc1ef7d51"
                              ]
                           ]
                        }
                        nodes.push(modbus_read);
                        nodes.push(modbus_func);
                        nodes.push(modbus_Switch);
                        nodes.push(modbus_ProcesTelegram);
                        nodes.push(modbus_Processhtml);
                        nodes.push(modbus_ProcessMail);
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
                     y = y + 200;
                  }
               }
               );
               break;
            case 'omron':
               const FinsConn: any = {
                  "id": plc._id.toString(),
                  "type": "FINS Connection",
                  "name": plc.name,
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
                                 'ofr' + sensor._id.toString(),
                                 's' + sensor._id.toString()
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
                        const modbus_Switch: any = {
                           "id": 's' + sensor._id.toString(),
                           "type": "switch",
                           "z": "c6c280ebbc516f5b",
                           "name": "",
                           "property": "payload",
                           "propertyType": "msg",
                           "rules": [
                              {
                                 "t": "gte",
                                 "v": "1300",         // GERARD AÑADIR AQUI RANGO MAXIMO SENSOR
                                 "vt": "num"
                              },
                              {
                                 "t": "lte",
                                 "v": "100",          // GERARD AÑADIR AQUI RANGO MINIMO SENSOR
                                 "vt": "num"
                              }
                           ],
                           "checkall": "true",
                           "repair": false,
                           "outputs": 2,
                           "x": 320,
                           "y": y + 50,
                           "wires": [
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ],
                              [
                                 't' + sensor._id.toString(),
                                 'm' + sensor._id.toString()
                              ]
                           ]
                        };
                        const modbus_ProcesTelegram: any = {
                           "id": 't' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Process",
                           "func": `let value = msg.payload;\n\nmsg.payload = {\n    content: "🚨 LIMITE SUPERADO\\n Línea: ${sensor.line}\\nPLC: ${sensor.plc_name}\\nValue: ` + "${value}" + `",\n    chatId: ${process.env.CHAT_ID_TELEGRAM},\n    type: \"message\"\n};\n\nreturn msg;`,
                           "outputs": 1,
                           "timeout": 0,
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 370,
                           "y": y + 50,
                           "wires": [
                              [
                                 "6c06b6c6dc43c887"
                              ]
                           ]
                        }
                        const modbus_Processhtml: any = {
                           "id": 'm' + sensor._id.toString(),
                           "type": "template",
                           "z": "c6c280ebbc516f5b",
                           "name": "html",
                           "field": "body",
                           "fieldType": "msg",
                           "format": "handlebars",
                           "syntax": "mustache",
                           "template": `<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <style>\n        /* Reset básico */\n        body, p, div {\n            margin: 0;\n            padding: 0;\n        }\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            background-color: #121212;\n            color: #e0e0e0;\n            -webkit-font-smoothing: antialiased;\n            -moz-osx-font-smoothing: grayscale;\n            line-height: 1.6;\n        }\n        .container {\n            max-width: 600px;\n            background-color: #1e1e1e;\n            margin: 40px auto;\n            border-radius: 8px;\n            padding: 30px 40px;\n            box-shadow: 0 8px 20px rgba(243,111,33,0.3);\n            border: 2px solid #f36f21;\n        }\n        .logo {\n            text-align: center;\n            margin-bottom: 30px;\n        }\n        .logo img {\n            width: 160px;\n            height: auto;\n            filter: brightness(0) invert(1); /* para logos negros que quieras invertir */\n        }\n        .alert-header {\n            font-size: 26px;\n            font-weight: 700;\n            color: #f36f21;\n            text-align: center;\n            margin-bottom: 25px;\n            letter-spacing: 1px;\n        }\n        .alert-box {\n            background-color: #2c2c2c;\n            border-left: 6px solid #f36f21;\n            padding: 25px 30px;\n            border-radius: 6px;\n            font-size: 18px;\n            color: #ddd;\n        }\n        .alert-box strong {\n            color: #f36f21;\n        }\n        .alert-box span {\n            color: #ff4c00;\n            font-weight: 700;\n        }\n        .footer {\n            text-align: center;\n            font-size: 14px;\n            color: #999999;\n            margin-top: 40px;\n            font-style: italic;\n        }\n        a {\n            color: #f36f21;\n            text-decoration: none;\n        }\n        /* Responsivo */\n        @media only screen and (max-width: 620px) {\n            .container {\n                margin: 20px 15px;\n                padding: 20px;\n            }\n            .alert-header {\n                font-size: 22px;\n            }\n            .alert-box {\n                font-size: 16px;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"logo\">\n            <img src=\"https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png\" alt=\"Fornet Logo\" />\n        </div>\n\n        <div class=\"alert-header\">🚨 Alerta de sistema detectada</div>\n\n        <div class=\"alert-box\">\n            Límite superado<br />\n            <strong>PLC:</strong> ${sensor.plc_name}<br />\n            <strong>Sensor:</strong> ${sensor.name}<br />\n            <strong>Valor:</strong> <span>` + "${msg.payload}" + `</span>\n        </div>\n\n        <div class=\"footer\">\n            Esta alerta ha sido generada automáticamente por <strong>Fornet</strong>.\n        </div>\n    </div>\n</body>\n</html>\n`,
                           "x": 370,
                           "y": y + 100,
                           "wires": [
                              [
                                 'pm' + sensor._id.toString()
                              ]
                           ]
                        }
                        const modbus_ProcessMail: any = {
                           "id": 'pm' + sensor._id.toString(),
                           "type": "function",
                           "z": "c6c280ebbc516f5b",
                           "name": "Transactional Emails",
                           "func": `let resultado = msg.body.replace` + "(\"${msg.payload}\", " + `msg.payload);\nmsg={\n    payload:resultado,\n    topic:\"FORNET Alerta Línea ${sensor.line}\",\n    to: \"fornetgle@gmail.com, ll.valls.v@gmail.com, induvalls@gmail.com\"\n   \n};\n\n\nreturn msg;`,     // GERARD AÑADIR AQUI MAILS SEPARADOS POR COMA COMO EN EL EJEMPLO
                           "outputs": 1,
                           "timeout": "",
                           "noerr": 0,
                           "initialize": "",
                           "finalize": "",
                           "libs": [],
                           "x": 420,
                           "y": y + 100,
                           "wires": [
                              [
                                 "98f0503cc1ef7d51"
                              ]
                           ]
                        }

                        nodes.push(FinsRead);
                        nodes.push(FinsFunc);
                        nodes.push(modbus_Switch);
                        nodes.push(modbus_ProcesTelegram);
                        nodes.push(modbus_Processhtml);
                        nodes.push(modbus_ProcessMail);

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
                     y = y + 200;
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
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}