import { NextResponse } from "next/server";
import mqtt from "mqtt";


export async function POST(request: Request, { params }: { params: { topic: string } }) {
   try {
      const topic = params.topic;
      const req = await request.json();
      const options = {
         username: process.env.MQTT_USER,
         password: process.env.MQTT_PASS,
         clientId: 'mqttjs_' + Math.random().toString(16).substring(2, 8)
      };
      let client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`, options);

      client.on("connect", () => {
         client.subscribe(topic, (err) => {
            if (!err) {
               client.publish(topic, req.message);
            }
         });
      });

      client.on("message", (topic, message) => {
         client.end();
      });
      return NextResponse.json('OK');
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}