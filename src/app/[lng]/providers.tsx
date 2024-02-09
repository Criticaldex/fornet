"use client";

import { SessionProvider, useSession } from "next-auth/react";

type Props = {
   children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {

   return <SessionProvider>{children}</SessionProvider>;
};
