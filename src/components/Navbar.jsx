
/*
Inseriamo gli import necessari per il funzionamento e lo stile della navbar, tra cui useNavigate
che ci permette di navigare attraverso le schermate del sito e il corrispettivo foglio di stile css.
*/

import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {

    const navigatore = useNavigate()

    return (
        <div className='StileNavbar'>
            <nav className='StileElementiNav'>
                <button onClick={() => navigatore('/')} title='Vai alla schermata Home' className='StileBottoneNav'><b>HOME</b></button>
                <button onClick={() => navigatore('/Workflow')} title='Vai alla schermata del Workflow' className='StileBottoneNav'><b>WORKFLOW</b></button>
            </nav>
        </div>
    )
}

export default Navbar;