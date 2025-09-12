import { getLines } from "@/services/plcs";
import { getSensorsbyLine } from "@/services/sensors";
import { LinesTable } from "./linesTable";
import { getSession } from "@/services/session";

export default async function Dashboard({ params }: any) {
   const { interval } = params;
   const session = await getSession();
   const lines = await getLines();
   const sensors = await getSensorsbyLine(session?.user.db);
   const types = ['line', 'candle', 'gauge', 'bool']
   let selected = {} as any;
   lines.map((line) => {
      // Check if sensors exist for this line
      const lineSensors = sensors[line];
      const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

      if (hasValidSensors) {
         // Initialize with the first sensor as default
         selected[line] = {
            type: 'line',
            sensor: lineSensors[0]?.name,
            unit: lineSensors[0]?.unit,
            minrange: lineSensors[0]?.minrange,
            maxrange: lineSensors[0]?.maxrange
         };

         // Create a sensors map for easy lookup during sensor changes
         selected[line].availableSensors = {};
         lineSensors.forEach((sensor: any) => {
            selected[line].availableSensors[sensor.name] = {
               unit: sensor.unit,
               minrange: sensor.minrange,
               maxrange: sensor.maxrange
            };
         });
      } else {
         // Handle lines with no sensors
         selected[line] = {
            type: 'line',
            sensor: null,
            unit: null,
            minrange: null,
            maxrange: null,
            availableSensors: {},
            noSensors: true
         };
      }
   });
   return (

      <>
         <div className="flex mx-2 mb-2">
            <div className="flex grow p-2 bg-bgLight rounded-md ">
               <LinesTable
                  lines={lines}
                  interval={interval}
                  sensors={sensors}
                  types={types}
                  selected={selected}
               />
            </div>
         </div>
      </>
   )
}
