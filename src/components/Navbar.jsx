import { Link } from 'react-router-dom'; // Import del componente Link fornito da react router dom
import { FaUser } from 'react-icons/fa'; // Import dell'icona "persona" per l'area riservata
import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css'; // Import del css della Navbar

const Navbar = () => {

    const navigatore = useNavigate()

    return (

        <div className='StileNavbar'> {/* Contenitore principale della navbar */}
            <nav className='StileElementiNav'> {/* Contenitore degli elementi della navbar e del loro stile*/}
                <button onClick={() => navigatore('/')} title='Vai alla schermata Home' className='StileBottoneNav'><b>HOME</b></button>
                <button onClick={() => navigatore('/Workflow')} title='Vai alla pagina Workflow' className='StileBottoneNav'><b>WORKFLOW</b></button>
            </nav>
        </div>
    )
}

export default Navbar;