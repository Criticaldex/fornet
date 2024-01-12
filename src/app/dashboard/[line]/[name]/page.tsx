import { getChartValues } from "@/services/values";
import { Chart } from "./chart";

export default async function Dashboard({ params }: any) {
   const { line, name } = params;
   const values = await getChartValues(line, name);

   return (
      <Chart
         name={'TOTAL EQA'}
         data={values}
      />
   )
}
