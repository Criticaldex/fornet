'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
   position: 'absolute' as 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 400,
   bgcolor: 'var(--background-color)',
   color: 'var(--text-color)',
   border: '2px solid var(--border)',
   borderradius: '0.375rem',
   boxShadow: 24,
   p: 4,
};

export default function BasicModal() {
   const [open, setOpen] = React.useState(false);
   const handleOpen = () => setOpen(true);
   const handleClose = () => setOpen(false);

   const onSubmit = handleSubmit(async (data: any) => {
      const session = await getSession();
      const upsertData = {
         line: data.line,
         name: data.name,
         unit: data.unit
      }
      const upsert = await upsertLabel(upsertData, session?.user.db);
      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else {
         toast.success('Object Added!', { theme: "colored" });
      }
      reset(data);

      setRows(await getLabels(session?.user.db));
   });

   return (
      <div>
         <Button onClick={handleOpen}>ADD Graph</Button>
         <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
         >
            <Box sx={style} className={'rounded-md'}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  New Graph
               </Typography>
               <form
                  id="labelForm"
                  className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
                  onSubmit={onSubmit}
               >
                  <div className="inline-flex justify-end">
                     <label htmlFor="line" className="flex self-center">Line:</label>
                     <select id="line"
                        className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.line ? 'border-foreground' : 'border-red'}`}
                        {...register("line", { required: 'Field Required' })}
                        onChange={e => {
                           setLinia(e.target.value)
                        }}>
                        <option key='' value=''>Select...</option>
                        {lines.map((line: any) => {
                           return <option key={line} value={`${line}`}>
                              {line}
                           </option>
                        })}
                     </select>
                  </div>
                  {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

                  <div className="inline-flex justify-end">
                     <label htmlFor="name" className="flex self-center">Name:</label>
                     <select id="name"
                        className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`}
                        {...register("name", { required: 'Field Required' })}>
                        <option key='' value=''>Select...</option>
                        {names.map((name: any) => {
                           return <option key={name} value={`${name}`}>
                              {name}
                           </option>
                        })}
                     </select>
                  </div>
                  {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

                  <div className="inline-flex justify-end">
                     <label htmlFor="unit" className="self-center">Unit:</label>
                     <input id="unit" type="unit" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
                        {...register("unit", { required: 'Field Required' })} />
                  </div>
                  {errors.unit && <p role="alert" className="text-red self-end">⚠ {errors.unit?.message}</p>}
                  <div className="inline-flex justify-around">
                     <input type="reset" onClick={reset} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
                     <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
                  </div>
               </form >
            </Box>
         </Modal>
      </div>
   );
}