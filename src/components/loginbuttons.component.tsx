"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { IoIosLogOut, IoIosPerson } from "react-icons/io"

export const LoginButton = () => {
   return (
      <button className="hover:text-darkBlue py-2 grid grid-cols-[max-content_max-content] gap-x-4 pt-2 pr-0 pb-2 pl-3 items-center" onClick={() => signIn()}>
         Sign in
      </button>
   );
};

export const RegisterButton = () => {
   return (
      <Link href="/register" className="hover:text-darkBlue py-2 grid grid-cols-[max-content_max-content] gap-x-4 pt-2 pr-0 pb-2 pl-3 items-center">
         Register
      </Link>
   );
};

export const LogoutButton = () => {
   const { data: session } = useSession();
   if (session && session.user) {
      return (
         <button className="hover:text-darkBlue py-2 grid grid-cols-[max-content_max-content] gap-x-4 pt-2 pr-0 pb-2 pl-3 items-center ml-3"
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}>
            <IoIosLogOut size={20} />
            <span className="text-lg">
               Sortir
            </span>
         </button>
      );
   } else {
      return (null);
   }

};

export const ProfileButton = () => {
   const { data: session } = useSession();
   return (
      <Link href="/admin/profile" className="hover:text-darkBlue py-2 grid grid-cols-[max-content_max-content] gap-x-4 pt-2 pr-0 pb-2 pl-3 items-center ml-3">
         <IoIosPerson size={20} />
         <span className="text-lg">
            {session?.user.lastname}, {session?.user.name}
         </span>
      </Link>
   )
};
