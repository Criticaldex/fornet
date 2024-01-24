export default async function ContractsLayout({ children }: any) {
   return (
      <div>
         <title>Quadre Comandament</title>
         <div className="mt-2 bg-light text-right flex justify-between items-center">
            <div className="bg-light text-right flex justify-end items-center">
               <h1 className="right-0 w-auto mx-10 font-semibold text-2xl italic">Quadre Comandament</h1>
            </div>
         </div>
         <hr className="w-11/12 m-auto border-b border-darkBlue" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}