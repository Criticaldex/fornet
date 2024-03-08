import { LiveChart } from "./liveChart";

export default async function Dashboard({ params }: any) {
   const { line, name } = params;

   return (
      <LiveChart
         title={'productividad'}
         line={line}
         name={name}
      />
   )
}