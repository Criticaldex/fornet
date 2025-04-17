const { MongoClient } = require('mongoose');
const cron = require('node-cron');

// Configuración de MongoDB
const url = process.env.MONGO_HOST; // URL de tu MongoDB
const dbName = 'empresa2' // Nombre de tu base de datos
const collectionName = 'values'; // Nombre de tu colección con los datos
const summaryCollectionName = 'summary'; // Colección donde guardarás los resúmenes

// Función para obtener la fecha de inicio y fin del día actual
function getStartAndEndOfDay() {
   const today = new Date();
   const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime(); // Medianoche
   const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime(); // Último milisegundo del día

   return { startOfDay, endOfDay };
}

// Función para procesar los datos, calcular los resúmenes y borrar los datos procesados
async function processDailyData() {
   const { startOfDay, endOfDay } = getStartAndEndOfDay();

   const client = new MongoClient(url);
   try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const summaryCollection = db.collection(summaryCollectionName);

      // Pipeline de agregación para calcular los valores mínimo, máximo y promedio
      const pipeline = [
         {
            $match: {
               timestamp: { $gte: startOfDay, $lte: endOfDay }
            }
         },
         {
            $group: {
               _id: { line: "$line", plc_name: "$plc_name", name: "$name" },
               min: { $min: "$value" },
               max: { $max: "$value" },
               avg: { $avg: "$value" }
            }
         },
         {
            $project: {
               line: "$_id.line",
               plc_name: "$_id.plc_name",
               name: "$_id.name",
               min: 1,
               max: 1,
               avg: 1,
               timestamp: startOfDay, // Timestamp como medianoche del día actual
               _id: 0
            }
         }
      ];

      // Ejecutar la agregación en la colección original
      const summaries = await collection.aggregate(pipeline).toArray();

      // Insertar o actualizar los resúmenes en la colección de resumen
      for (const summary of summaries) {
         await summaryCollection.updateOne(
            { line: summary.line, plc_name: summary.plc_name, name: summary.name, timestamp: summary.timestamp },
            { $set: summary },
            { upsert: true }
         );
      }

      console.log('Resúmenes diarios procesados con éxito');

      // Borrar los datos procesados de la colección original
      await collection.deleteMany({
         timestamp: { $gte: startOfDay, $lte: endOfDay }
      });

      console.log('Datos del día eliminados de la colección original');
   } catch (err) {
      console.error('Error al procesar los datos:', err);
   } finally {
      await client.close();
   }
}

// Programar el cron job para que se ejecute cada día a medianoche (00:00)
cron.schedule('0 0 * * *', () => {
   console.log('Ejecutando cron job para procesar los datos del día...');
   processDailyData();
});
