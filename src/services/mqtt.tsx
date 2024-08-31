import { connectAsync } from "mqtt"

export const sendMqtt = async (topic: string, value: string) => {
   console.log('AAAAAAAAAa');

   const client = await connectAsync('mqtt://broker.hivemq.com');
   console.log('client: ', client);


   client.on("connect", () => {
      client.subscribe(topic, (err) => {
         if (!err) {
            console.log('OKKKKKK');
            client.publish(topic, value);
         } else {
            console.log('ERRORRRR');

         }
      });
   });

}