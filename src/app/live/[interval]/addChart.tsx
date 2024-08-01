'use client'
import { color } from "highcharts";
import React, { useState } from "react";
import Modal from "react-modal";

export function AddChart() {
   const [isOpen, setIsOpen] = useState(false)
   const customStyles = {
      content: {
         top: '50%',
         left: '50%',
         right: 'auto',
         bottom: 'auto',
         marginRight: '-50%',
         color: '#000',
         bgcolor: '#222',
         transform: 'translate(-50%, -50%)',
      },
   };

   function openModal() {
      setIsOpen(true);
   }

   // function afterOpenModal() {
   //    // references are now sync'd and can be accessed.
   //    subtitle.style.color = '#f00';
   // }

   function closeModal() {
      setIsOpen(false);
   }

   return (
      <div>
         <button className='text-3xl' onClick={openModal}>+Modal+</button>
         <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
         >
            <h2>Hello</h2>
            <button onClick={closeModal}>close</button>
            <div>I am a modal</div>
            <form>
               <input />
               <button>tab navigation</button>
               <button>stays</button>
               <button>inside</button>
               <button>the modal</button>
            </form>
         </Modal>
      </div>
   )
}