import React from 'react'
import styles from "../menuCarrito/menuCarrito.module.css"
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

export default function MenuCarrito({showMenu, setShowMenu}) {
    const navigate = useNavigate();

    return (
    <>
        <div>
            <p onClick={()=>setShowMenu(false)} className={styles.close_icon}><IoMdClose/></p>
            <div className={styles.menu_container}>
                <div className={styles.opciones}>
                    <p onClick={()=>navigate("/")}>Cambiar Cliente</p>
                    <p>opciones</p>
                    <p>opciones</p>
                    <p>opciones</p>
                </div>
            </div>
        </div>
    </>
  )
}

