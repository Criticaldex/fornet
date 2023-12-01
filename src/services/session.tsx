import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getSession = async () => {
   return await getServerSession(authOptions);
}