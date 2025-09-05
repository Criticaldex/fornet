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

// Helper function to safely build alert emails list
function buildAlertEmailsList(alertEmails: UserIface[]): string {
   if (!alertEmails || alertEmails.length === 0) {
      return "";
   }

   return alertEmails
      .filter(user => user && user.email && typeof user.email === 'string')
      .map(user => user.email.trim())
      .filter(email => email.length > 0)
      .join(', ');
}

// Helper function to validate PLC data
function validatePlc(plc: any): plc is PlcIface {
   return plc &&
      plc._id &&
      plc.name &&
      typeof plc.name === 'string' &&
      plc.line &&
      typeof plc.line === 'string' &&
      plc.type &&
      typeof plc.type === 'string' &&
      plc.ip &&
      typeof plc.ip === 'string';
}

// Helper function to validate sensor data
function validateSensor(sensor: any): sensor is SensorIface {
   return sensor &&
      sensor._id &&
      sensor.name &&
      typeof sensor.name === 'string' &&
      sensor.address &&
      sensor.line &&
      typeof sensor.line === 'string';
}

// Helper function to process PLC sensors safely
function processPlcSensors(
   plc: PlcIface,
   sensorByName: Record<string, SensorIface[]>,
   nodes: any[],
   y: number,
   emailsToSendAlerts: string
): number {
   let currentY = y;
   const plcSensors = sensorByName[plc.name];

   if (!plcSensors || !Array.isArray(plcSensors)) {
      console.warn('[Node-RED Flows] No sensors found for PLC', { plcName: plc.name });
      return currentY;
   }

   plcSensors.forEach((sensor: any) => {
      if (!validateSensor(sensor)) {
         console.warn('[Node-RED Flows] Invalid sensor data, skipping', {
            sensorId: sensor?._id,
            plcName: plc.name
         });
         return;
      } if (sensor.line !== plc.line || (!sensor.read && !sensor.write)) {
         return;
      }

      try {
         if (sensor.read) {
            if (sensor.autoinc) {
               switch (plc.type) {
                  case 'siemens':
                     nodeReadSiemensAutoInc(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
                  case 'modbus':
                     nodeReadModbusAutoInc(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
                  case 'omron':
                     nodeReadOmronAutoInc(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
               }
            } else {
               switch (plc.type) {
                  case 'siemens':
                     nodeReadSiemens(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
                  case 'modbus':
                     nodeReadModbus(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
                  case 'omron':
                     nodeReadOmron(sensor, plc, currentY, nodes, emailsToSendAlerts);
                     break;
               }
            }
         }

         if (sensor.write) {
            switch (plc.type) {
               case 'siemens':
                  nodeWriteSiemens(sensor, plc, currentY, nodes);
                  break;
               case 'modbus':
                  nodeWriteModbus(sensor, plc, currentY, nodes);
                  break;
               case 'omron':
                  nodeWriteOmron(sensor, plc, currentY, nodes);
                  break;
            }
         }

         currentY += 200;
      } catch (sensorError) {
         console.error('[Node-RED Flows] Error processing sensor', {
            error: sensorError,
            sensorId: sensor._id,
            plcName: plc.name
         });
      }
   });

   return currentY;
}

export async function GET(request: Request, { params }: { params: { db: string, node: string } }) {
   try {
      // Validate authentication token
      const token = headers().get('token');
      if (!token || token !== process.env.NEXT_PUBLIC_API_KEY) {
         console.warn('[Node-RED Flows] Unauthorized access attempt', {
            ip: headers().get('x-forwarded-for') || 'unknown',
            userAgent: headers().get('user-agent')
         });
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }

      // Validate input parameters
      if (!params.db || !params.node) {
         console.error('[Node-RED Flows] Missing required parameters', { params });
         return NextResponse.json({ ERROR: 'Missing required parameters: db and node' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         console.error('[Node-RED Flows] Invalid database name', { db: params.db });
         return invalidDatabaseResponse();
      }

      // Sanitize parameters
      const dbName = params.db.trim();
      const node = params.node.trim();

      console.log('[Node-RED Flows] Processing request', { dbName, node });

      // Establish database connections with error handling
      await dbConnect();

      let db, dbAuth;
      try {
         db = mongoose.connection.useDb(dbName, { useCache: true });
         dbAuth = mongoose.connection.useDb('Auth', { useCache: false });
      } catch (dbError) {
         console.error('[Node-RED Flows] Database connection error', { error: dbError, dbName });
         return NextResponse.json({ ERROR: 'Database connection failed' }, { status: 500 });
      }

      // Register models safely
      try {
         if (!db.models.sensor) {
            db.model('sensor', SensorSchema);
         }

         if (!db.models.plc) {
            db.model('plc', PlcSchema);
         }

         if (!dbAuth.models.user) {
            dbAuth.model('user', UserSchema, 'users');
         }
      } catch (modelError) {
         console.error('[Node-RED Flows] Model registration error', { error: modelError });
         return NextResponse.json({ ERROR: 'Model registration failed' }, { status: 500 });
      }

      // Fetch data with comprehensive error handling
      let sensors: SensorIface[] = [];
      let plcs: PlcIface[] = [];
      let alertEmails: UserIface[] = [];

      try {
         [sensors, plcs, alertEmails] = await Promise.all([
            db.models.sensor.find().lean() as Promise<SensorIface[]>,
            db.models.plc.find({ node: node }).lean() as Promise<PlcIface[]>,
            dbAuth.models.user.find({ alert: true }).lean() as Promise<UserIface[]>
         ]);

         console.log('[Node-RED Flows] Data fetched successfully', {
            sensorsCount: sensors.length,
            plcsCount: plcs.length,
            alertEmailsCount: alertEmails.length
         });
      } catch (queryError) {
         console.error('[Node-RED Flows] Database query error', { error: queryError, node });
         return NextResponse.json({ ERROR: 'Failed to fetch data from database' }, { status: 500 });
      }

      // Validate that we have data to work with
      if (!sensors || sensors.length === 0) {
         console.warn('[Node-RED Flows] No sensors found', { dbName, node });
         return NextResponse.json({ WARNING: 'No sensors found for this configuration' });
      }

      if (!plcs || plcs.length === 0) {
         console.warn('[Node-RED Flows] No PLCs found for node', { dbName, node });
         return NextResponse.json({ WARNING: 'No PLCs found for the specified node' });
      }

      // Process sensor data safely
      const sensorByName = _.groupBy(sensors.filter(sensor =>
         sensor && sensor.plc_name && typeof sensor.plc_name === 'string'
      ), 'plc_name');

      // Build alert emails string safely
      const emailsToSendAlerts = buildAlertEmailsList(alertEmails);

      // Initialize nodes configuration
      const nodes = getBaseNodesConfig(dbName);
      let y = 100;

      // Process PLCs with comprehensive validation and error handling
      let processedCount = 0;
      let skippedCount = 0;

      plcs.forEach((plc: any) => {
         if (!validatePlc(plc)) {
            console.warn('[Node-RED Flows] Invalid PLC data, skipping', {
               plcId: plc?._id,
               plcName: plc?.name
            });
            skippedCount++;
            return;
         }

         try {
            // Add global nodes for the PLC type
            switch (plc.type) {
               case 'siemens':
                  globalSiemensNodes(plc, sensorByName, nodes);
                  break;
               case 'modbus':
                  globalModbusNodes(plc, nodes);
                  break;
               case 'omron':
                  globalOmronNodes(plc, nodes);
                  break;
               default:
                  console.warn('[Node-RED Flows] Unknown PLC type', {
                     plcName: plc.name,
                     type: plc.type
                  });
                  skippedCount++;
                  return;
            }

            // Process sensors for this PLC
            y = processPlcSensors(plc, sensorByName, nodes, y, emailsToSendAlerts);
            processedCount++;

         } catch (plcError) {
            console.error('[Node-RED Flows] Error processing PLC', {
               error: plcError,
               plcId: plc._id,
               plcName: plc.name
            });
            skippedCount++;
         }
      });

      console.log('[Node-RED Flows] Processing completed', {
         processedCount,
         skippedCount,
         totalNodes: nodes.length
      });

      return NextResponse.json(nodes);

   } catch (err) {
      console.error('[Node-RED Flows] Unexpected error', {
         error: err,
         dbName: params.db,
         node: params.node
      });
      return NextResponse.json({
         ERROR: 'Internal server error',
         message: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
   }
}