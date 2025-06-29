export default async function MqttLayout({ children }: any) {
   return (
      <div>
         <title>Fornet | PowerBi</title>
         <hr className="m-auto border-b border-accent mx-4 rounded-md" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}