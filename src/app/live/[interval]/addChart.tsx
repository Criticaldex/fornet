'use client'
import React, { useState } from "react";
import Modal from "styled-react-modal";

export function AddChart() {
    const [isOpen, setIsOpen] = useState(false)

    function toggleModal(e: any) {
        setIsOpen(!isOpen)
    }

    const StyledModal = Modal.styled`
  width: 20rem;
  height: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
`

    return (
        <div>
            <button className='text-3xl' onClick={toggleModal}>+Modal+</button>
            <Modal
                isOpen={isOpen}
                onBackgroundClick={toggleModal}
                onEscapeKeydown={toggleModal}>
                <span>I am a modal!</span>
                <button onClick={toggleModal}>Close me</button>
            </Modal>
        </div>
    )
}