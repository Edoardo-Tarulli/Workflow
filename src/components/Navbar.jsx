
/*
Inseriamo gli import necessari per il funzionamento e lo stile della navbar
*/

import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {

    const navigatore = useNavigate()

    return (

        <div className='StileNavbar'> {/* Contenitore principale della navbar */}
            <nav className='StileElementiNav'> {/* Contenitore degli elementi della navbar e del loro stile*/}
                {/* Bottoni che vanno ad integrare la navigazione verso la pagina home stessa e il workflow (per ora) */}
                <button onClick={() => navigatore('/')} title='Vai alla schermata Home' className='StileBottoneNav'><b>HOME</b></button>
                <button onClick={() => navigatore('/Workflow')} title='Vai alla schermata del Workflow' className='StileBottoneNav'><b>WORKFLOW</b></button>
            </nav>
        </div>
    )
}

export default Navbar;