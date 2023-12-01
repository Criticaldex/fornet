'use client'
import { Chart } from "./chart";
import { ChartDetail } from "./chartDetail";
import { useState, useEffect } from "react";
import { getPlotLines, getSeleccioDetall } from "@/services/iqfs";
import { Loading } from "@/components/loading.component";

export function SeleccioContainer({ year, centros, seleccio }: any) {
   const [seccio, setSeccio] = useState('antihipertensius');
   const [detall, setDetall] = useState(null);
   const [plotLines, setPlotLines] = useState(null);
   const [isLoading, setLoading] = useState(true)

   useEffect(() => {
      getSeleccioDetall(year, centros, seccio)
         .then((res: any) => {
            setDetall(res)
            getPlotLines(seccio)
               .then((res: any) => {
                  setPlotLines(res)
                  setLoading(false)
               });
         });

   }, [seccio, year, centros])

   if (isLoading) return <Loading />

   return (
      <div>
         <section className="grid grid-cols-2 gap-1 m-2 bg-seleccio p-1 rounded-md">
            <div className="col-span-2 flex bg-bgLight rounded-md p-3">
               <h1 className="flex self-center basis-2/6 uppercase text-2xl">Totals Selecció</h1>
               <div className="flex grow justify-around text-center">
                  {seleccio.data.map(({ name, total }: any, index: number) => (
                     <div className="centrosSeleccio" key={index}>
                        <p className="flex p-2 rounded-md border-y-2 h-full text-xl font-bold">
                           {name}: {total[total.length - 1]}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-1 bg-bgLight rounded-md shadow-xl">
               <Chart
                  name={'Selecció'}
                  data={seleccio.data}
                  categories={seleccio.categories}
                  setter={setSeccio}
               />
            </div>
            <div className="p-1 bg-bgLight rounded-md shadow-xl">
               <ChartDetail
                  name={seccio}
                  data={detall}
                  objectius={plotLines}
               />
            </div>
         </section>
      </div>
   );
}
