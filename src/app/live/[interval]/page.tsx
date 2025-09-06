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
      // Initialize with the first sensor as default
      selected[line] = {
         type: 'line',
         sensor: sensors[line][0]?.name,
         unit: sensors[line][0]?.unit,
         minrange: sensors[line][0]?.minrange,
         maxrange: sensors[line][0]?.maxrange
      };

      // Create a sensors map for easy lookup during sensor changes
      selected[line].availableSensors = {};
      sensors[line]?.forEach((sensor: any) => {
         selected[line].availableSensors[sensor.name] = {
            unit: sensor.unit,
            minrange: sensor.minrange,
            maxrange: sensor.maxrange
         };
      });
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
