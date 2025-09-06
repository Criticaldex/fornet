import Image from 'next/image';

export const Loading = () => {
   return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
         <div className="fornet-loading">
            <Image
               src="/fornet_color.svg"
               alt="Fornet Loading"
               width={120}
               height={120}
               className="fornet-logo-bounce"
               priority
            />
         </div>
      </div>
   );
};