import { getLines } from "@/services/plcs";
import { getSensorsbyLine } from "@/services/sensors";
import { LinesTable } from "./linesTable";
import { getSession } from "@/services/session";
import { getMappedCandleValues } from "@/services/values";

export default async function Dashboard({ params }: any) {
   const { interval } = params;
   const session = await getSession();
   const lines = await getLines();
   const sensors = await getSensorsbyLine(session?.user.db);
   const types = ['line', 'candle', 'gauge', 'bool']
   let selected = {} as any;
   lines.map((line) => { selected[line] = { type: 'line', sensor: sensors[line][0].name, unit: sensors[line][0].unit } });

   const data = await getMappedCandleValues({ line: 'Random', name: 'Temperatura', interval: 8 }, session?.user.db);
   setInitialData(data);

   // if (data.length > 0) {
   //    const lastCandle = data[data.length - 1];
   //    currentCandleRef.current = {
   //       open: lastCandle[1],
   //       high: lastCandle[2],
   //       low: lastCandle[3],
   //       close: lastCandle[4],
   //       timestamp: lastCandle[0],
   //    };
   //    setLastPrice(lastCandle[4]);
   //    lastTimestampRef.current = lastCandle[0];
   // }

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

function setInitialData(data: [number, number, number, number, number][]) {
   throw new Error("Function not implemented.");
}
