import React from 'react'
import styles from "../modalNotas/modalNotas.module.css"

export default function ModalNotas({notas, setNotas, setShowAgregarNotas}) {
    return (
        <>
            <div className='overlay'></div>
            <div className={styles.modal_notas}>
                <div className={styles.div_notas}>
                    <h5>Agrega una nota</h5>
                    <div className={styles.div_nota}>
                        <label htmlFor="notas">Notas:</label>
                        <textarea
                            id="notas"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder='Escribe una nota aquí'
                        />
                    </div>
                    <div className={styles.div_notas_guardadas}>
                        <h5>Notas guardadas</h5>
                        <div className={styles.notas_guardadas}>
                            <p>asdasa</p>
                            <p>sdasd asdas</p>
                            <p>asda asda asdasd</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAgregarNotas(false)}>Confirmar o cerrar</button>
                </div>
            </div>
        </>
    )
}
