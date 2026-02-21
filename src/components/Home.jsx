import '../css/Home.css' // Import del css del componente
import { FaCog } from 'react-icons/fa'; // Import dell'icona ingranaggio
import { FaLongArrowAltRight } from "react-icons/fa";
import { PiArrowBendRightDownBold } from "react-icons/pi";
import { PiArrowBendLeftDownBold } from "react-icons/pi";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Rivelatore from './Rivelatore.jsx';


const Home = () => {


const navigatore = useNavigate()


    return (
    <>
        <div className = 'StileHome'>
        {/* Elemento che contiene la scritta "Workflow" */}
            <div className = 'ContenitoreScritta ApparizioneImmediata'>
                <FaCog className = 'StileIngranaggio' style={{marginRight: '10px'}} />
                <hr style = {{width: '10px', border: 'none'}}></hr> 
                <h1 className = 'ScrittaWorkflow'>MyFlow</h1>
                {/* L'icona dell'ingranaggio */}
                <FaCog className = 'StileIngranaggio' />
            </div>

            {/*Di seguito il contenitore della scritta*/}
            <Rivelatore>
            <div className='StileDescrizioneSito'>
                <p className='StileDescrizione'> Benvenuto in My Flow! <br/>
                Organizza workflows di blocchi<br/>
                collegandoli tra di loro<br />
                come più preferisci.
                </p>
                <FaLongArrowAltRight className='StileFrecciaAnimata' style={{marginLeft: '50px', width: '200px', height: '100px'}}></FaLongArrowAltRight>
                <img className='stile-immagine' src='src/assets/workflow_animation.gif' alt='immagine non disponibile' title='Diagramma di flusso'></img>
            </div>
            </Rivelatore>
            
            <div style={{width: '100vw', height: '150px', marginLeft: '80%', marginTop: '160px'}}>
                <PiArrowBendRightDownBold style={{width: '200px', height: '100px', marginTop: '40px'}}></PiArrowBendRightDownBold>
            </div>
            
            <Rivelatore>
            <div className='StileDescrizioneSito'>
                <img className='imgPersonalizzazione' alt='Immagine non disponibile' title='Personalizzazione' src='src/assets/Personalizzazione.png'></img>
                <FaLongArrowAltLeft className='StileFrecciaAnimata' style={{marginLeft: '80px', width: '200px', height: '100px'}}></FaLongArrowAltLeft>
                <p style={{marginLeft: '80px'}} className='StileDescrizione'> Ogni blocco è un'operazione <br/> sulla quale puoi stabilire <br/> delle proprietà e che verrà <br/> applicata a datastream di dati </p>
            </div>
            </Rivelatore>
            

            <div style={{width: '100vw', height: '150px',  marginTop: '160px', marginLeft: '10%'}}>
                <PiArrowBendLeftDownBold style={{width: '200px', height: '100px', marginTop: '40px'}}></PiArrowBendLeftDownBold>
            </div>

            <Rivelatore>
            <div className='StileDescrizioneSito'>
                <p style={{marginLeft: '200px'}} className='StileDescrizione'> Ed infine salva ed esporta <br/> il tuo lavoro!</p>
                <FaLongArrowAltRight className='StileFrecciaAnimata' style={{marginLeft: '50px', width: '200px', height: '100px'}}></FaLongArrowAltRight>
                <img style={{height: '300px', width: '350px', color: 'black', marginLeft: '80px', border: '1px solid', borderRadius: '50%'}} title='Salva' src='src/assets/saveProject.gif'></img>
            </div>
            </Rivelatore>
            

            <div style={{width: '100vw', height: '100px', marginTop: '150px', alignItems: 'center', justifyContent: 'center' , display: 'flex'}}>
                <FaLongArrowAltDown style={{height: '100px', width: '200px'}}></FaLongArrowAltDown>
            </div>

            <Rivelatore>
            <div style={{marginTop: '80px', width: '100vw', height: '100px', alignContent: 'center', display: 'flex', justifyContent: 'center'}}>
                <button  className='buttonStart' onClick={() => navigatore('/Workflow')}><b>Inizia Ora!</b> </button>
            </div>
            </Rivelatore>
        </div>
    </>
    )

};

export default Home;