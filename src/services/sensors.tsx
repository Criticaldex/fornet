import _ from "lodash"
import { SensorIface } from "@/schemas/sensor";

export const getSensors = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const upsertSensor = async (filter: SensorIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deleteSensor = async (filter: SensorIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}