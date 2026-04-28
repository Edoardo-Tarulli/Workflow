
/*
In seguito abbiamo tutti gli import necessari per lo stile e il funzionamento della pagina.
In particolare abbiamo tutte le frecce, ingranaggi ed in generale le icone che fanno parte di React Icons
Infine abbiamo l'hook chiamato useNavigate che ci permette di navigare tra le diverse schermate dell'editor e
il Rivelatore, componente utilizzato per mostrare gli elementi della pagina home in maniera graduale scorrendo verso il basso
in maniera animata e fluida.
*/

import '../css/Home.css';
import { FaCog } from 'react-icons/fa'; 
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
        <div className = 'stile-home'>
        {/* Elemento che contiene la scritta "Workflow" e gli ingranaggi. */}
            <div className = 'contenitore-scritta apparizione-immediata'>
                <FaCog className = 'stile-ingranaggio' style={{marginRight: '10px'}} />
                <hr style = {{width: '10px', border: 'none'}}></hr> 
                <h1 className = 'scritta-workflow'>MyFlow</h1>
                {/* L'icona dell'ingranaggio */}
                <FaCog className = 'stile-ingranaggio' />
            </div>

            {/*Di seguito il contenitore della scritta e la prima sezione della descrizione con le relative frecce e l'immagine
            Il tutto viene wrappato all'interno del componente Rivelatore che ne permette lo "slice" scorrendo verso il basso.
            */}

            <Rivelatore>    
            <div className='stile-descrizione-sito'>
                <p className='stile-descrizione'> Benvenuto in My Flow! <br/>
                Organizza workflows di blocchi<br/>
                collegandoli tra di loro<br />
                come più preferisci.
                </p>
                <FaLongArrowAltRight className='stile-freccia-animata' style={{marginLeft: '50px', width: '200px', height: '100px'}}></FaLongArrowAltRight>
                <img className='stile-immagine-workflow' src='src/assets/workflow_animation.gif' alt='immagine non disponibile' title='Diagramma di flusso'></img>
            </div>
            </Rivelatore>


            {/* Stile e inserimento della freccia di destra che prosegue il percorso. */}
            <div style={{width: '100vw', height: '150px', marginLeft: '80%', marginTop: '160px'}}>
                <PiArrowBendRightDownBold style={{width: '200px', height: '100px', marginTop: '40px'}}></PiArrowBendRightDownBold>
            </div>


            {/* Continuo di descrizione sito con seconda sezione descrizione, immagine e frecce. */}
            <Rivelatore>
            <div className='stile-descrizione-sito'>
                <img className='stile-immagine-personalizzazione' alt='Immagine non disponibile' title='Personalizzazione' src='src/assets/Personalizzazione.png'></img>
                <FaLongArrowAltLeft className='stile-freccia-animata' style={{marginLeft: '80px', width: '200px', height: '100px'}}></FaLongArrowAltLeft>
                <p style={{marginLeft: '80px'}} className='stile-descrizione'> Ogni blocco è un'operazione <br/> sulla quale puoi stabilire <br/> delle proprietà e che verrà <br/> applicata a datastream di dati </p>
            </div>
            </Rivelatore>
            
            {/* Stile e inserimento della freccia di sinistra che continua il percorso. */}
            <div style={{width: '100vw', height: '150px',  marginTop: '160px', marginLeft: '10%'}}>
                <PiArrowBendLeftDownBold style={{width: '200px', height: '100px', marginTop: '40px'}}></PiArrowBendLeftDownBold>
            </div>

            {/* Ultima sezione descrizione sito con immagine salva. */}
            <Rivelatore>
            <div className='stile-descrizione-sito'>
                <p style={{marginLeft: '200px'}} className='stile-descrizione'> Ed infine salva ed esporta <br/> il tuo lavoro!</p>
                <FaLongArrowAltRight className='stile-freccia-animata' style={{marginLeft: '50px', width: '200px', height: '100px'}}></FaLongArrowAltRight>
                <img className='stile-immagine-salva' title='Salva' src='src/assets/saveProject.gif'></img>
            </div>
            </Rivelatore>
            
            {/* Inserimento e stile freccia verso il basso che punta verso il bottone inizia ora. */}
            <div style={{width: '100vw', height: '100px', marginTop: '150px', alignItems: 'center', justifyContent: 'center' , display: 'flex'}}>
                <FaLongArrowAltDown style={{height: '100px', width: '200px'}}></FaLongArrowAltDown>
            </div>

            {/* Inserimento e stile del bottone inizia ora, che porta al workflow. */}
            <Rivelatore>
            <div style={{marginTop: '80px', width: '100vw', height: '100px', alignContent: 'center', display: 'flex', justifyContent: 'center'}}>
                <button  className='bottone-start' onClick={() => navigatore('/Workflow')}><b>Inizia Ora!</b> </button>
            </div>
            </Rivelatore>
        </div>
    )

};

export default Home;