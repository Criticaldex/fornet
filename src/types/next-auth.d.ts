import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
   /**
    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
    */
   interface Session {
      user: {
         name: string,
         lastname: string,
         email: string,
         password: string,
         license: {
            token: string,
            start: Date,
            end: Date,
         },
         server: string,
         db: string,
         role: string,
      } & DefaultSession["user"]
   }
}