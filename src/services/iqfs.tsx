import _ from "lodash"

const getIqfs = async (filter: any) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/iqfs`,
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

export const updateIqf = async (data: any) => {
   data.dbName = "IQF";
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/iqfs`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
}

export const getIqf = async (up: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/iqfs/${process.env.IQF_DEFAULT_YEAR}/${up}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

export const getIqfDashboard = async (up: string) => {
   const iqf = await getIqf(up);
   let primerIndiceNoNulo = iqf.puntuacio_universals.findIndex((elemento: null) => elemento !== null);
   const data = [{
      name: 'Universal',
      data: iqf.puntuacio_universals.slice(primerIndiceNoNulo)
   }, {
      name: 'Selecció',
      data: iqf.puntuacio_seleccio.slice(primerIndiceNoNulo)
   }, {
      name: 'Hiperprescripció',
      data: iqf.puntuacio_hiperprescripcio.slice(primerIndiceNoNulo)
   }]
   return data;
}

export const getTotalsIqf = async (year: string, centros: any) => {
   const ups: any[] = [];
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';
      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })
      const dades = iqf.puntuacio_total

      let primerIndiceNoNulo = dades.findIndex((elemento: null) => elemento !== null);
      let diferencia = null
      if (dades.slice(primerIndiceNoNulo).length > 1) {
         diferencia = dades[dades.length - 1] - dades[dades.length - 2]
      }

      return {
         name: name,
         data: dades.slice(primerIndiceNoNulo),
         diferencia: diferencia
      }
   });

   return data;
}

export const getBasal = async (up: string) => {
   const iqf = await getIqf(up);
   return iqf.basal;
}

export const getUniversals = async (year: string, centros: any) => {
   const ups: any[] = [];
   const categories = ['matma', 'biosimilars']
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';
      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })
      // name += ' - ' + iqf.puntuacio_universals[iqf.puntuacio_universals.length - 1] + ' punts';

      const matma = iqf.indicadors_universals.matma;
      const biosimilars = iqf['indicadors_universals_(biosimilars)'].biosimilars;

      const dades = [
         matma.puntuacio[matma.puntuacio.length - 1],
         biosimilars.puntuacio[biosimilars.puntuacio.length - 1],
      ]

      return {
         name: name,
         data: dades,
         total: iqf.puntuacio_universals
      }
   });

   return {
      categories,
      data
   };
}

export const getHiper = async (year: string, centros: any) => {
   const ups: any[] = [];
   const categories = ['aines', 'condoprotectors', 'antiulcerosos', 'benzodiazepines', 'antibacterians', 'antiespasmodics']
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';
      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })

      let dades: any = [];

      for (const [key, value] of (Object.entries(iqf.indicadors_dhiperprescripcio) as [string, any][])) {
         if (value.puntuacio) {
            dades.push(value.puntuacio[value.puntuacio.length - 1])
         }
      }

      return {
         name: name,
         data: dades,
         total: iqf.puntuacio_hiperprescripcio
      }
   });

   return {
      categories,
      data
   };
}

export const getSeleccio = async (year: string, centros: any) => {
   let categories: any[] = [];
   const ups: any[] = [];
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';
      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })

      let cat: any[] = [];
      let dades: any = [];

      for (const [key, value] of (Object.entries(iqf.indicadors_de_seleccio_de_medicaments) as [string, any][])) {
         if (value.puntuacio) {
            dades.push(value.puntuacio[value.puntuacio.length - 1])
            cat.push(key);
         }
      }

      categories = cat;

      return {
         name: name,
         data: dades,
         total: iqf.puntuacio_seleccio
      }
   });

   return {
      categories,
      data
   };
}

export const getUniversalsDetall = async (year: string, centros: any, seccio: any) => {
   const ups: any[] = [];
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';

      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })

      let dades: any = '';
      let numeradors: any = '';
      let denominadors: any = '';

      switch (seccio) {
         case 'biosimilars':
            dades = iqf['indicadors_universals_(biosimilars)'].biosimilars['%'];
            numeradors = iqf['indicadors_universals_(biosimilars)'].biosimilars.numerador;
            denominadors = iqf['indicadors_universals_(biosimilars)'].biosimilars.denominador;
            break;
         default:
            dades = iqf.indicadors_universals.matma['%'];
            numeradors = iqf.indicadors_universals.matma.numerador;
            denominadors = iqf.indicadors_universals.matma.denominador;
            break;
      }
      let primerIndiceNoNulo = dades.findIndex((elemento: null) => elemento !== null);

      const map = dades.map((item: any) => parseFloat((item * 100).toFixed(2)));

      return {
         name: name,
         data: map.slice(primerIndiceNoNulo),
         numeradors: numeradors.slice(primerIndiceNoNulo),
         denominadors: denominadors.slice(primerIndiceNoNulo)
      }
   });
   return data;
}

export const getHiperDetall = async (year: string, centros: any, seccio: any) => {
   const ups: any[] = [];
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';

      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })

      const dades = iqf['indicadors_dhiperprescripcio'][seccio].dhd_st;
      let primerIndiceNoNulo = dades.findIndex((elemento: any) => elemento !== null);

      const map = dades.map((item: any) => {
         if (item) return parseFloat((item).toFixed(2));
      })

      return {
         name: name,
         data: map.slice(primerIndiceNoNulo)
      }
   });

   return data;
}

export const getSeleccioDetall = async (year: string, centros: any, seccio: any) => {
   const ups: any[] = [];
   centros.map(({ id, name, up }: any) => (
      ups.push(up)
   ))

   const iqfs = await getIqfs({
      any: year,
      up: {
         $in: ups
      }
   });

   const data: any[] = iqfs.map((iqf: any) => {
      let name: string = '';

      centros.map((centro: { up: any; name: string; }) => {
         if (centro.up == iqf.up) {
            name = centro.name;
         }
      })

      const dades = iqf['indicadors_de_seleccio_de_medicaments'][seccio]['%'];
      const numeradors = iqf['indicadors_de_seleccio_de_medicaments'][seccio].numerador;
      const denominadors = iqf['indicadors_de_seleccio_de_medicaments'][seccio].denominador;
      let primerIndiceNoNulo = dades.findIndex((elemento: null) => elemento !== null);

      const mapDades = dades.map((item: any) => parseFloat((item * 100).toFixed(2)));

      return {
         name: name,
         data: mapDades.slice(primerIndiceNoNulo),
         numeradors: numeradors.slice(primerIndiceNoNulo),
         denominadors: denominadors.slice(primerIndiceNoNulo)
      }
   });
   return data;
}

export const getPlotLines = async (seccio: any) => {
   let plotlines: any = '';
   switch (seccio) {
      case 'matma':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 0.71,
            label: {
               text: '10p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 0.81,
            label: {
               text: '8p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 0.94,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 1.04,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 1.30,
            label: {
               text: '2p'
            }
         }]
         break;

      case 'biosimilars':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 32,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 24,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 17,
            label: {
               text: '1p'
            }
         }]
         break;

      //Hiperprescripcio

      case 'aines':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 22.3,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 26.7,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 30,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 33.7,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 37.5,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'antiulcerosos':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 96.1,
            label: {
               text: '9p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 103.9,
            label: {
               text: '7p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 112.9,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 119.9,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 126.1,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'condoprotectors':
         //SYSADOA al pdf
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 1,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 1.6,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'benzodiazepines':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 56.2,
            label: {
               text: '7p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 63.4,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 68.8,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 77.1,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 86.1,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'antiespasmodics':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 5.8,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 6.7,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 7.4,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 8.2,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 9.1,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'antibacterians':
         //Antibiotics al pdf
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 5.8,
            label: {
               text: '10p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 6.8,
            label: {
               text: '8p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 7.7,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 8.6,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 9.3,
            label: {
               text: '2p'
            }
         }]
         break;

      //Seleccio

      case 'antihipertensius':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 71,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 70,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 68,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 66,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 64,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'ibp':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 90,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 89,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 87,
            label: {
               text: '2p'
            }
         }]
         break;

      case 'osteoporosi':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 64,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 61,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 58,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 53,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 48,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'hipocolesterolemiants':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 80,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 78,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 75,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 73,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'antidepressius_1a_linia':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 66,
            label: {
               text: '6p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 65,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 63,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 62,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 59,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'antidepressius_2a_linia':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 41,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 36,
            label: {
               text: '1p'
            }
         }]
         break;

      case 'hipoglucemiants_monoterapia_recomanada':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 77,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 75,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 74,
            label: {
               text: '2p'
            }
         }]
         break;

      case 'hipoglucemiants_biterapia_recomanada':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 46,
            label: {
               text: '4p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 41,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 39,
            label: {
               text: '2p'
            }
         }]
         break;

      case 'mpoc_seleccio':
         plotlines = [{
            color: 'var(--green)',
            width: 2,
            value: 37,
            label: {
               text: '7p'
            }
         }, {
            color: 'var(--yellow)',
            width: 2,
            value: 35,
            label: {
               text: '5p'
            }
         }, {
            color: 'var(--orange)',
            width: 2,
            value: 32,
            label: {
               text: '3p'
            }
         }, {
            color: 'var(--orange-1)',
            width: 2,
            value: 30,
            label: {
               text: '2p'
            }
         }, {
            color: 'var(--red)',
            width: 2,
            value: 26,
            label: {
               text: '1p'
            }
         }]
         break;

      default:
         plotlines = [];
         break;
   }
   return plotlines;
}