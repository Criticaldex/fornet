import { getSession } from "@/services/session"


const getCentros = async () => {
   const session = await getSession();
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/centers`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               db: session?.user.db,
               fields: [
                  "centers",
                  "-_id"
               ],
            }
         ),
      }).then(res => res.json());
}

export const getCenters = async () => {
   const centros: any = await getCentros();
   return await centros.centers.map((centro: any, i: number) => {
      return {
         id: centro.id,
         name: centro.name,
         up: centro.up,
      }
   })
}