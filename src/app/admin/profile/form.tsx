'use client';

import { UserIface } from "@/schemas/user";
import { upsertUser, deleteUser } from "@/services/users";
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { signOut } from "next-auth/react";

export const UsersForm = ({ user, toast }: any) => {
   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<UserIface>();

   useEffect(() => {
      if (user) {
         reset(user);
      }
   }, [reset, user])

   const onSubmit: SubmitHandler<UserIface> = async (data) => {
      if (dirtyFields.license) {
         await deleteUser(user.email);
         toast.error('¡Usuari Eliminat! 🖕🤓', { theme: "colored" });
         signOut({ redirect: false, callbackUrl: "/" })
      } else if (dirtyFields.email) {
         toast.warning('No es pot Modificar el correu!', { theme: "colored" });
         reset(user);
      } else if (isDirty == true && (dirtyFields.password || dirtyFields.name || dirtyFields.lastname)) {
         delete data.license;
         const upsert = await upsertUser(data);
         if (upsert.lastErrorObject?.updatedExisting) {
            toast.success('Usuari Modificat!', { theme: "colored" });
         }
         reset(upsert.value);
      } else {
         toast.warning('No s\'ha Modificat cap camp!', { theme: "colored" });
      }
   };

   return (
      <form
         id="userForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={handleSubmit(onSubmit)}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="email" className="flex self-center">Email:</label>
            <input id="email" type="email" disabled className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.email ? 'border-foreground' : 'border-red'}`} {...register("email", {
               required: 'Camp obligatori',
               minLength: {
                  value: 5,
                  message: 'Valor minim 5 caracters'
               },
               maxLength: {
                  value: 50,
                  message: 'Valor maxim 50 caracters'
               },
               pattern: {
                  value: /([\w\.]+)@([\w\.]+)\.(\w+)/g,
                  message: "Format incorrecte"
               },
            })} />
         </div>
         {errors.email && <p role="alert" className="text-red self-end">⚠ {errors.email?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="password" className="self-center">Contrasenya:</label>
            <input id="password" type="password" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.password ? 'border-foreground' : 'border-red'}`} {...register("password")} />
         </div>
         {errors.password && <p role="alert" className="text-red self-end">⚠ {errors.password?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="name" className="self-center">Nom:</label>
            <input id="name" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`} {...register("name", {
               maxLength: {
                  value: 30,
                  message: 'Valor maxim 30 caracters'
               }
            })} />
         </div>
         {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="lastname" className="self-center">Cognom:</label>
            <input id="lastname" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.lastname ? 'border-foreground' : 'border-red'}`} {...register("lastname", {
               maxLength: {
                  value: 30,
                  message: 'Valor maxim 30 caracters'
               }
            })} />
         </div>
         {errors.lastname && <p role="alert" className="text-red self-end">⚠ {errors.lastname?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="licenseStart" className="self-center">Inici Llicencia:</label>
            <input id="licenseStart" type="date" disabled className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.license?.start ? 'border-foreground' : 'border-red'}`} {...register("license.start", {
               required: 'Camp obligatori',
            })} />
         </div>
         {errors.license?.start && <p role="alert" className="text-red self-end">⚠ {errors.license?.start?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="licenseEnd" className="self-center">Fi Llicencia:</label>
            <input id="licenseEnd" type="date" disabled className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.license?.end ? 'border-foreground' : 'border-red'}`} {...register("license.end", {
               required: 'Camp obligatori',
            })} />
         </div>
         {errors.license?.end && <p role="alert" className="text-red self-end">⚠ {errors.license?.end.message}</p>}
         <div className="inline-flex justify-around">
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-darkBlue'} type="submit" value="Enviar" />
         </div>
      </form >
   );
};