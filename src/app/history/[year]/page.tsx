import { getLines } from "@/services/plcs";
import { getSensorsbyLine } from "@/services/sensors";
import { LinesTable } from "./linesTable";
import { getSession } from "@/services/session";
import { getChartSummaries, getLineDrilldown, getLineSummaries } from "@/services/summaries";

export default async function Dashboard({ params }: any) {
   const { year } = params;
   const session = await getSession();
   const lines = await getLines();
   const sensors = await getSensorsbyLine(session?.user.db);
   let chartsData: any = {};
   let drilldown: any = {};
   let selected = {} as any;

   for (const line of (lines as any[])) {
      if (session?.user.config.summary[line]) {
         chartsData[line] = await getLineSummaries(line, year, session);
         drilldown[line] = await getLineDrilldown(line, year, session);
      }
   }

   // Initialize selected with safe sensor access
   lines.map((line) => {
      const lineSensors = sensors[line];
      const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

      selected[line] = {
         sensor: hasValidSensors ? lineSensors[0].name : null,
         unit: hasValidSensors ? lineSensors[0].unit : null,
         hasValidSensors: hasValidSensors
      };
   });
   return (
      <>
         <div className="flex mx-2 mb-2">
            <div className="flex grow p-2 bg-bgLight rounded-md ">
               <LinesTable
                  lines={lines}
                  year={year}
                  sensors={sensors}
                  selected={selected}
                  chartsData={chartsData}
                  drilldown={drilldown}
               />
            </div>
         </div>
      </>
   )

}