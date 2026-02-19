import '../css/Home.css' // Import del css del componente
import { FaCog } from 'react-icons/fa'; // Import dell'icona ingranaggio
import { FaCircle } from 'react-icons/fa'; // Import dell'icona cerchio che usiamo per la palla
import { PiRectangleBold } from 'react-icons/pi'; // Import dei rettangoli su cui passa la palla



const Home = () => {
    return (
    <>
        <div className = 'StileHome'>
        {/* Elemento che contiene la scritta "Workflow" */}
            <div className = 'ContenitoreScritta'>
                <FaCog className = 'StileIngranaggio' style={{marginRight: '10px'}} />
                <hr style = {{width: '10px', border: 'none'}}></hr> 
                <h1 className = 'ScrittaWorkflow'>
                    MyFlow
                </h1>
                {/* L'icona dell'ingranaggio */}
                <FaCog className = 'StileIngranaggio' />
            </div>

            {/*Di seguito il contenitore della scritta*/}
            <div className='StileDescrizioneSito'>
                <p className='StileDescrizione'> Benvenuto in My Flow! <br/>
                Organizza workflows di blocchi<br/>
                collegandoli tra di loro<br />
                come più preferisci.
                </p>
                <img className='stile-immagine' src='src\assets\workflow_animation.gif' alt='immagine non disponibile' title='Diagramma di flusso'></img>
            </div>


            {/*Di seguito il contenitore della pallina che attraversa i tre rettangoli colorati*/}
            <div className = 'ContenitoreAnimazione'>
                    <PiRectangleBold className="IconaStep step-1"/>
                    <PiRectangleBold className="IconaStep step-2"/>
                    <PiRectangleBold className="IconaStep step-3"/>
                    <FaCircle className = "PallinaAnimata" />
            </div>

        </div>
    </>
    )

};

export default Home;