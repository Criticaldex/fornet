import { getLines } from "@/services/plcs";
import { getSensorsbyLine } from "@/services/sensors";
import { LinesTable } from "./linesTable";
import { getSession } from "@/services/session";
import { getChartSummaries, getLineSummaries } from "@/services/summaries";

export default async function Dashboard({ params }: any) {
   const { year } = params;
   const session = await getSession();
   const lines = await getLines();
   const sensors = await getSensorsbyLine(session?.user.db);
   let chartsData: any = {};

   for (const [line, configLine] of (Object.entries(session?.user.config.summary) as [string, any][])) {
      chartsData[line] = await getLineSummaries(line, year, session);

      let selected = {} as any;
      lines.map((line) => { selected[line] = { sensor: sensors[line][0].name, unit: sensors[line][0].unit } });

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
                  />
               </div>
            </div>
         </>
      )
   }
}