import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import _ from "lodash"
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import UserSchema, { UserIface } from '@/schemas/user'
import PlcSchema, { PlcIface } from '@/schemas/plc'
import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import { getBaseNodesConfig } from "@/services/nodered"
import { globalSiemensNodes, nodeReadSiemens, nodeReadSiemensAutoInc, nodeWriteSiemens } from "@/services/nodered"
import { globalModbusNodes, nodeReadModbus, nodeReadModbusAutoInc, nodeWriteModbus } from "@/services/nodered"
import { globalOmronNodes, nodeReadOmron, nodeReadOmronAutoInc, nodeWriteOmron } from "@/services/nodered"
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'

export async function GET(request: Request, { params }: { params: { db: string, node: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      const node = params.node;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      const dbAuth = mongoose.connection.useDb('Auth', { useCache: false });

      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }

      if (!dbAuth.models.user) {
         dbAuth.model('user', UserSchema, 'users');
      }

      const sensors = (await db.models.sensor.find().lean()) as SensorIface[];
      const plcs = (await db.models.plc.find({ node: node }).lean()) as PlcIface[];
      const sensorByName = _.groupBy(sensors, 'plc_name');
      const alertEmails = (await dbAuth.models.user.find({ alert: true }).lean()) as UserIface[];
      let emailsToSendAlerts = "";
      for (let i = 0; i < alertEmails.length; i++) {
         if (i === alertEmails.length - 1) {
            emailsToSendAlerts += alertEmails[i].email;
         } else {
            emailsToSendAlerts += alertEmails[i].email + ', ';
         }
      }

      let nodes = getBaseNodesConfig(dbName);
      let y = 100;

      plcs.forEach(plc => {
         if (!plc._id || !plc.name || !plc.line || !plc.type || !plc.ip) {
            return;
         }
         switch (plc.type) {
            case 'siemens':

               globalSiemensNodes(plc, sensorByName, nodes);

               sensorByName[plc.name].forEach(sensor => {
                  if (!sensor._id || !sensor.name || !sensor.address || !sensor.line) {
                     return;
                  }
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {
                        if (sensor.autoinc) {
                           nodeReadSiemensAutoInc(sensor, plc, y, nodes, emailsToSendAlerts);
                        } else {
                           nodeReadSiemens(sensor, plc, y, nodes, emailsToSendAlerts);
                        }
                     }
                     if (sensor.write) {
                        nodeWriteSiemens(sensor, plc, y, nodes);
                     }
                     y = y + 200;
                  }
               });
               break;
            case 'modbus':
               globalModbusNodes(plc, nodes);
               sensorByName[plc.name].forEach(sensor => {
                  if (!sensor._id || !sensor.name || !sensor.address || !sensor.line) {
                     return;
                  }
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {
                        if (sensor.autoinc) {
                           nodeReadModbusAutoInc(sensor, plc, y, nodes, emailsToSendAlerts);
                        } else {
                           nodeReadModbus(sensor, plc, y, nodes, emailsToSendAlerts);
                        }
                     }
                     if (sensor.write) {
                        nodeWriteModbus(sensor, plc, y, nodes);
                     }
                     y = y + 200;
                  }
               }
               );
               break;
            case 'omron':
               globalOmronNodes(plc, nodes);
               sensorByName[plc.name].forEach(sensor => {
                  if (!sensor._id || !sensor.name || !sensor.address || !sensor.line) {
                     return;
                  }
                  if (sensor.line == plc.line && (sensor.read || sensor.write)) {
                     if (sensor.read) {
                        if (sensor.autoinc) {
                           nodeReadOmronAutoInc(sensor, plc, y, nodes, emailsToSendAlerts);
                        } else {
                           nodeReadOmron(sensor, plc, y, nodes, emailsToSendAlerts);
                        }
                     }
                     if (sensor.write) {
                        nodeWriteOmron(sensor, plc, y, nodes);
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