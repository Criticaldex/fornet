const getDmas = async (filter: any) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dmas`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               fields: [
                  "-_id"
               ],
               filter: filter,
            }
         ),
      }).then(res => res.json());
}

const getDma = async (up: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dmas/${up}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

export const getDmaDashboard = async (up: string) => {
   const dma = await getDma(up);
   let primerIndiceNoNulo = dma.import_liquid_acumulat_periode_actual.findIndex((elemento: null) => elemento !== null);

   const data = {
      name: 'Import Líquid Acumulat',
      data: dma.import_liquid_acumulat_periode_actual.slice(primerIndiceNoNulo)
   }
   return data;
}

export const getDmaAssignada = async (up: string) => {
   const dma = await getDma(up);
   return dma.dma_assignada[dma.dma_assignada.length - 1];
}

export const getRegressioLineal = async (up: string, data: any) => {
   const dma = await getDma(up);
   const linea = dma['previsio_de_tancament_(lineal)'][dma['previsio_de_tancament_(lineal)'].length - 1];

   let primerIndiceNoNulo = dma.import_liquid_acumulat_periode_actual.findIndex((elemento: null) => elemento !== null);
   let primerPunto = dma.import_liquid_acumulat_periode_actual[primerIndiceNoNulo]

   let regresion = []
   regresion.push(primerPunto)
   for (var i = 0; i < 10 - primerIndiceNoNulo; i++) {
      regresion.push(null)
   }
   regresion.push(parseFloat(linea.toFixed(2)))

   return regresion


}