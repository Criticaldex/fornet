import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from 'bcryptjs';
import { logLogin, logLogout, logError } from '@/services/logs';

export const authOptions: NextAuthOptions = {
   session: {
      strategy: "jwt",
      maxAge: 1 * 8 * 60 * 60, // 8 hores
   },
   providers: [
      CredentialsProvider({
         name: "Sign in",
         credentials: {
            email: {
               label: "Email",
               type: "email",
               placeholder: "example@example.com",
            },
            password: {
               label: "Password",
               type: "password"
            },
         },
         async authorize(credentials: any) {
            const { email, password } = credentials as any
            try {
               const user = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                  {
                     method: 'POST',
                     headers: {
                        'Content-type': 'application/json',
                     },
                     body: JSON.stringify(
                        {
                           email,
                           password
                        }
                     ),
                  }
               ).then(res => res.json());

               if (!user) {
                  // Log failed login attempt
                  await logError(email, 'AUTH', 'Invalid credentials provided');
                  return null;
               } else if (user?.ERROR) {
                  // Log authentication error
                  await logError(email, 'AUTH', user.ERROR);
                  throw new Error(user.ERROR)
               }

               // Log successful login
               await logLogin(email, user.db);
               return user;
            } catch (error: any) {
               // Log any authentication errors
               await logError(email, 'AUTH', `Login failed: ${error.message}`);
               throw error;
            }
         }
      }),
   ],
   pages: {
      signIn: "/auth/signin",
      signOut: '/auth/signout',
      error: '/auth/error'
   },
   callbacks: {
      session: ({ session, token }) => {
         // console.log("Session Callback", { session, token });
         const u = token.user as unknown as any;
         return {
            ...session,
            user: {
               ...session.user,
               ...u
            },
         };
      },
      jwt: ({ token, user, trigger, session }) => {
         // console.log("JWT Callback", { token, user });
         if (session && trigger === "update") {
            const u = session as unknown as any;
            return {
               ...token,
               user: u
            };
         }
         if (user) {
            const u = user as unknown as any;
            return {
               ...token,
               user: u
            };
         }
         return token;
      },
   },
};
