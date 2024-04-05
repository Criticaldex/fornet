import { getSession } from "@/services/session";
import { LiveChart } from "./liveChart";
import { getLines, getNames } from "@/services/values";


export default async function Dashboard() {
   const session = await getSession();
   const lines = await getLines();
   const names = await getNames();

   return (
      <>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  lines={lines}
                  names={names}
                  session={session}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  lines={lines}
                  names={names}
                  session={session}
               />
            </div>
         </div>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  lines={lines}
                  names={names}
                  session={session}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  lines={lines}
                  names={names}
                  session={session}
               />
            </div>
         </div>
      </>
   )
}