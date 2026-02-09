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
                <FaCog className = 'StileIngranaggio' />
                <hr style = {{width: '10px', border: 'none'}}></hr> 
                <h1 className = 'ScrittaWorkflow'>
                    WORKFLOW
                </h1>
                {/* L'icona dell'ingranaggio */}
                <FaCog className = 'StileIngranaggio' />
            </div>

            {/*Di seguito il contenitore della scritta*/}
            <div className='StileDescrizioneSito'>
                <p> Benvenuto in My Flow! <br />
                Che cosa puoi fare in questo sito?<br />
                Puoi creare Workflows di blocchi, quindi organizzarli e gestirli come meglio credi!<br />
                Ogni blocco corrisponde ad un operazione, alla quale puoi associare delle proprietà.
                </p>
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