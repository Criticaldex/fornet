'use client'
import { GaugeChart } from "./gaugeChart";
import { TrendChart } from "./trendChart";

export function Totals({ iqfTotals }: any) {
   const iqf = iqfTotals
   const colores = ["#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e12"]

   return (
      <section className="flex m-2 justify-around bg-bgLight rounded-md p-3 overflow-hidden">
         {iqf.map((total: any, index: number) => (
            <div key={index} className={`text-center flex-auto w-48 max-w-sm flex flex-col`}>
               <div className="text-2xl font-bold">
                  {total.name}
               </div>
               <div className="text-center grow m-2">
                  <GaugeChart
                     data={total}
                     numColor={colores[index]}
                  />
               </div>
               <div className="text-center max-w-sm m-auto flex">
                  <div>
                     <TrendChart
                        data={total}
                        numColor={colores[index]}
                     />
                  </div>
                  <div>
                     {total.diferencia != null ? (
                        <p className={`text-xl font-bold ${total.diferencia < 0 ? "text-red" : total.diferencia > 0 ? "text-green" : 'text-yellowCustom'}`}>
                           {total.diferencia < 0 ?
                              <span>&#8600;</span> :
                              total.diferencia > 0 ?
                                 <span>&#8599;</span> :
                                 <span>&#8594;</span>
                           }
                           {total.diferencia}
                        </p>
                     ) : (
                        <p></p>
                     )}
                  </div>
               </div>
            </div>
         ))}
      </section>
   )
}