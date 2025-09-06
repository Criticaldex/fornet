import _ from "lodash"
import { NodeIface } from "@/schemas/node";
import { getSession } from "./session";

const getNodes = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nodes/${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const getNodeNames = async (db: string) => {
   const nodes = await getNodes(db);
   const res = nodes.map((node: NodeIface) => (node.name));
   return res;
}

export const patchNodes = async (data: NodeIface, db?: string) => {

   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nodes/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
}