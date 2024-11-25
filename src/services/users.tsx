import _ from "lodash"
import { UserIface } from "@/schemas/user";
import { hash } from 'bcryptjs';

export const getUsers = async () => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const getUser = async (email: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${email}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const getUsersbyDB = async (db: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?db=${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const upsertUser = async (data: UserIface) => {
   const saltRounds = 10;
   if (data.password) {
      data.hash = await hash(data.password, saltRounds);
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
}

export const updateConfig = async (data: UserIface) => {
   if (!data.config) {
      return Response.json(`Config Mandatory!`);
   }
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify({ email: data.email, config: data.config }),
      }).then(res => res.json());
}

export const deleteUser = async (email: string) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${email}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}