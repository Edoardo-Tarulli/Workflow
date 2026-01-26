import { Link } from 'react-router-dom'; // Import del componente Link fornito da react router dom
import { FaUser } from 'react-icons/fa'; // Import dell'icona "persona" per l'area riservata
import '../css/Navbar.css'; // Import del css della Navbar

const Navbar = () => {

    return (

        <div className='StileNavbar'> {/* Contenitore principale della navbar */}
            <nav className='StileElementiNav'> {/* Contenitore degli elementi della navbar e del loro stile*/}
                <li title = "Torna alla schermata iniziale">
                    <Link to = {'/'} style = {{textDecoration: 'none'}}> Home </Link>
                </li> 
                <li title = "Vai al Workflow">
                    <Link to = {'/Workflow'} style = {{textDecoration: 'none'}}> Workflow </Link>
                </li>
                <li title = "Visualizza i tuoi Workflow"> I miei Workflows </li>

                <button title = "Vai alla tua area riservata">
                    <FaUser style = {{width: '20px'}}></FaUser>
                </button>
            </nav>
        </div>
    )
}

export default Navbar;