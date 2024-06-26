import _ from "lodash"
import { LabelIface } from "@/schemas/label";

export const getLabelsbyDB = async (db: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${db}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

// export const upsertLabel = async (data: LabelIface) => {
//    const saltRounds = 10;
//    if (data.password) {
//       data.hash = await hash(data.password, saltRounds);
//    }

//    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`,
//       {
//          method: 'PATCH',
//          headers: {
//             'Content-type': 'application/json',
//          },
//          body: JSON.stringify(data),
//       }).then(res => res.json());
// }

// export const deleteLabel = async (email: string) => {
//    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${email}`,
//       {
//          method: 'DELETE',
//          headers: {
//             'Content-type': 'application/json',
//          },
//       }).then(res => res.json());
// }