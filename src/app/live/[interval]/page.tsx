import { getLines } from "@/services/plcs";
import { getSensorsbyLine } from "@/services/sensors";
import { LinesTable } from "./linesTable";
import { getSession } from "@/services/session";

export default async function Dashboard({ params }: any) {
   const { interval } = params;
   const session = await getSession();
   const lines = await getLines();
   const sensors = await getSensorsbyLine(session?.user.db);
   const types = ['line', 'gauge', 'bool']
   let selected = {} as any;
   lines.map((line) => { selected[line] = { type: 'line', sensor: sensors[line][0].name, unit: sensors[line][0].unit } });

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