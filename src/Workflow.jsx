import { useCallback, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import { CgAdd } from "react-icons/cg";
import Navbar from './components/Navbar';
import { SCHEMA_PROPRIETA } from './data/schemaProprieta';
import { useWorkflowActions } from './hooks/useWorkflowActions';
import { getCampiFinali, generaNuovoIdPerTipo } from './utils/workflowHelpers';
import { useWorkflow } from './WorkflowContext';
import { TipoNodi } from './components/CustomNodes';
import '@xyflow/react/dist/style.css';
import '../src/css/Workflow.css'
import '../src/css/CustomNodes.css';
import '../src/css/ReactFlowTheme.css';


function WorkflowEditor() {

  // Recupera tutto dal Context invece che da useState locali
  const {
    blocchi, SettaBlocchi,
    collegamenti, SettaCollegamenti,
    SidebarAperta, SettaAperturaSidebar,
    GestioneAperta, SettaGestioneAperta,
    ModalitaDark, SettaModalitaDark
  } = useWorkflow();

  const [messaggioErrore, SettaMessaggioErrore] = useState(null);
  const { screenToFlowPosition } = useReactFlow();
  const nodoSelezionato = blocchi.find((blocco) => blocco.selected === true);

  const {
    AggiornaBlocchi,
    AggiornaCollegamenti,
    Associa,
    aggiornaDatoNodo, 
    gestisciArrayStringhe, 
    gestisciDizionarioAggregazioni 
  } = useWorkflowActions(SettaBlocchi, SettaCollegamenti, nodoSelezionato?.id);

  const campiFinali = getCampiFinali(nodoSelezionato, SCHEMA_PROPRIETA);

  const InizioTrascinamento = (event, tipoNodo) => {
      event.dataTransfer.setData('application/reactflow', tipoNodo);
      event.dataTransfer.effectAllowed = 'move';
    };

  // 2. Permettere il rilascio sopra il workflow
  const SopraWorkflow = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 3. Azione al rilascio (Creazione Nodo)
  const AlRilascio = useCallback(
    (event) => {
      event.preventDefault();
      const tipo = event.dataTransfer.getData('application/reactflow'); // Recuperiamo il tipo di nodo passato durante il drag
      if (!tipo) return;

      // Calcoliamo la posizione corretta nel workflow trasformando la posizione del nodo in pixel sulla barra di destra in posizione workflow
      const posizione = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nuovoId = generaNuovoIdPerTipo(tipo);

      // Creiamo il nuovo oggetto nodo, contraddistinto da id, tipo, posizione e data
      const nuovoNodo = {
        id: nuovoId, 
        type: tipo,
        position: posizione,
        data: { label: nuovoId.toUpperCase() },
      };

      SettaBlocchi((nds) => nds.concat(nuovoNodo));
    },
    [screenToFlowPosition]
  );


/*
Questa è la funzione che ci permette di gestire i collegamenti "validi", vale a dire che due nodi diversi possono essere mandati 
allo stesso nodo solo se quest'ultimo è un union, altrimenti per due nodi abbiamo bisogno ad esempio di due aggregate, due filter etc.
Inoltre utilizziamo quello che viene chiamato react-hot-toast per una visualizzazione a schermo di un messaggio errore in caso
l'utente provi a collegare un nodo ad un nodo successivo, al quale è già collegato un altro nodo (a meno che non sia union!)
*/

const connessioneValida = useCallback((connection) => {
    const targetNode = blocchi.find((n) => n.id === connection.target);
    
    if (targetNode && targetNode.type !== 'union') {
      const collegamentiInIngresso = collegamenti.filter(
        (edge) => edge.target === connection.target
      );
      
      if (collegamentiInIngresso.length >= 1) {
        // TRIGGER MESSAGGIO
        SettaMessaggioErrore("Solo il nodo Union può ricevere più stream in ingresso!");
        
        // Autoreset del messaggio dopo 3 secondi
        setTimeout(() => SettaMessaggioErrore(null), 3000);
        
        return false; 
      }
    }
    return true;
  }, [blocchi, collegamenti]);

/*
La funzione che segue ci permette di andare a verificare se il nodo selezionato è union e in caso
troviamo i nodi che sono connessi ad esso.
*/

const nodiSorgenteConnessi = (nodoSelezionato?.type === 'union') 
  ? collegamenti
      .filter((edge) => edge.target === nodoSelezionato.id)
      .map((edge) => edge.source) // Prendiamo l'ID del nodo di origine
  : [];


/*
Questa è la funzione che ci consente di andare a trasformare i dati grafici di React Flow, 
quindi nodi e collegamenti, in formato JSON. 
*/

// 
const gestisciEsportazione = useCallback(() => {
  try {
    // Va a guardare ogni singolo blocco presente nel workflow, e per ogni di esso
    // crea un oggetto che diventa poi uno step del JSON di uscita
    const steps = blocchi.map((nodo) => {
      /*
      Con filter va a prendere tutti i collegamenti e tiene solo quelli la cui sorgente è
      il nodo che stiamo analizzando in quel momento e di tali collegamenti con il map, ne
      estrae l'id del target (cioè il nodo a cui stiamo puntando). Come risultato ci da 
      un array di stringhe 
      */
      const collegamentiInUscita = collegamenti
        .filter((edge) => edge.source === nodo.id)
        .map((edge) => edge.target);

      /*
      Qui viene utilizzato il destructuring e l'operatore rest (i tre puntini), questo perché
      react di default inserisce una label dentro data che serve per il testo sul rettangolo del nodo e 
      quindi la andiamo a separare e teniamo tutto il resto quindi i parametri topic, servers etc. Il || [] serve
      a evitare errori nel caso in cui il nodo non abbia dati
      */
      const { label, ...datiPuliti } = nodo.data || {};

      const nuovoStep = {
        id: nodo.id,
        type: nodo.type,
        ...datiPuliti,
      };

      // 4. LOGICA CONDIZIONALE:
      // Se NON è un sink, aggiungiamo l'array next.
      // Se È un sink, non aggiungiamo next perché è l'ultimo blocco, quello che chiude il workflow
      if (nodo.type !== 'sink') {
        nuovoStep.next = collegamentiInUscita;
      }

      // Se vuoi forzare un sinkType di default qualora l'utente non l'abbia scelto:
      else if (!nuovoStep.sinkType) {
        nuovoStep.sinkType = "print"; 
      }

      return nuovoStep;
    });

    /*
    Questa è la parte finale che trasforma il JSON in un BLOB (che da quello che ho 
    capito è un oggetto che rappresenta dati binari); crea un url temporaneo che punta 
    a questi dati binari; crea un elemento di tipo <a> quindi un link, invisibile nel codice
    Poi simula un click sul link per far partire il download nel browser e infine pulisce
    tutto tramite revoke per non occupare memoria inutilmente, con un catch in caso di 
    errore nel processo di esportazione. 
    */

    const workflowFinale = { steps };
    const dataStr = JSON.stringify(workflowFinale, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Errore durante l'esportazione:", error);
  }
}, [blocchi, collegamenti]); 

  return (
    <>
      <div className={`StileDivWorkflow ${ModalitaDark ? 'dark-mode' : ''}`}>

        {/* MESSAGGIO DI AVVISO A SCHERMO */}
        {messaggioErrore && (
          <div className="toast-errore-workflow">
            <span>⚠️ {messaggioErrore}</span>
          </div>
        )}

        <ReactFlow
          nodes = {blocchi}
          edges = {collegamenti}
          onNodesChange = {AggiornaBlocchi}
          onEdgesChange = {AggiornaCollegamenti}
          onConnect = {Associa}
          onDrop={AlRilascio}
          onDragOver={SopraWorkflow}
          nodeTypes={TipoNodi}
          fitView
          colorMode={ModalitaDark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: true }} // serve per nascondere il link al sito React Flow in basso a destra che compare di default
          isValidConnection={connessioneValida}
          >
          <Background variant="dots" gap={12} size={1} />
          <Controls
            className={`sposta-controlli ${SidebarAperta ? 'aperta' : ''}`}
            showZoom showFitView
            
          />
          <MiniMap
            className={`sposta-minimappa ${GestioneAperta ? 'aperta' : ''}`}
            nodeColor='black' ariaLabel='Mappa del flusso' bgColor='#AFEEEE' maskColor='none' pannable={false} zoomable={false}></MiniMap>
          <Panel position='top-left'>
            <IoIosArrowDroprightCircle
            className={`icona-toggle ${SidebarAperta ? 'aperta' : ''}`}
            onClick={ () => SettaAperturaSidebar(!SidebarAperta)}
            title = 'Apri Sidebar'
            >
            </IoIosArrowDroprightCircle>
          </Panel>
          <Panel position='top-center'>
            <FaCircle
            className='IconaCambiaSfondo' 
            title='Cambia Tema'
            onClick={() => SettaModalitaDark(!ModalitaDark)}>
            </FaCircle>
          </Panel>
          <Panel position='top-right'>
            <IoIosArrowDropleftCircle
            className={`icona-gestione ${GestioneAperta ? 'aperta' : ''}`}
            onClick={() => SettaGestioneAperta(!GestioneAperta)}
            title = 'Apri menù gestione'        
            >
            </IoIosArrowDropleftCircle>
          </Panel>
          <Panel position='bottom-center'>
            <CgAdd
            title='Salva ed esporta'
            className='IconaSalvaEsporta'
            onClick={gestisciEsportazione}
            >
            </CgAdd>
          </Panel>
        </ReactFlow>

        {/* Sidebar Laterale */}
        <aside className={`sidebar-blocchi ${SidebarAperta ? 'visibile' : ''}`}>
        <h3>Libreria Blocchi</h3>
        <hr></hr>
        <div className="lista-nodi">

          {/* Blocco Source (input) */}
          <div
            className="blocco-sidebar"
            style={{ borderLeftColor: '#FF0000', '--colore-hover': '#FF0000' }}
            onDragStart={(event) => InizioTrascinamento(event, 'source')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#FF0000' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Source"</b></span>
          </div>

          {/* Blocco Filter (filtraggio) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FFA500', '--colore-hover': '#FFA500' }}
            onDragStart={(event) => InizioTrascinamento(event, 'filter')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#FFA500' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Filter"</b></span>
          </div>

          {/* Blocco Map (mapping) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#BDB76B', '--colore-hover': '#BDB76B' }}
            onDragStart={(event) => InizioTrascinamento(event, 'map')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#BDB76B' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Map"</b></span>
          </div>

          {/* Blocco KeyBy (si va a filtrare i campi del nodo) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#3CB371', '--colore-hover': '#3CB371' }}
            onDragStart={(event) => InizioTrascinamento(event, 'keyby')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#3CB371' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "KeyBy"</b></span>
          </div>

          {/* Blocco Window (finestra) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#0000FF', '--colore-hover': '#0000FF' }}
            onDragStart={(event) => InizioTrascinamento(event, 'window')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#0000FF' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Window"</b></span>
          </div>

          {/* Blocco Aggregate (aggregazione) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#800080', '--colore-hover': '#800080' }}
            onDragStart={(event) => InizioTrascinamento(event, 'aggregate')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#800080' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Aggregate"</b></span>
          </div>

          {/* Blocco Union (unione di due o più nodi) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#BC8F8F', '--colore-hover': '#BC8F8F' }}
            onDragStart={(event) => InizioTrascinamento(event, 'union')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#BC8F8F' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Union"</b></span>
          </div>

          {/* Blocco Sink (output) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#8B4513', '--colore-hover': '#8B4513' }}
            onDragStart={(event) => InizioTrascinamento(event, 'sink')} 
            draggable
          >
            <div className="punto-colore" style={{ '--colore-nodo': '#8B4513' }}></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Sink"</b></span>
          </div>

        </div>
        </aside>

        {/* Di seguito c'è il codice che riguarda la sidebar di destra */}
        <aside className={`sidebar-gestione ${GestioneAperta ? 'visibile' : ''}`}>
        <h3>Proprietà</h3>
        <hr />
        {!nodoSelezionato ? (
          <p className="testo-vuoto">Seleziona un blocco per vederne i parametri.</p>
        ) : (
          <div className="container-proprieta">

            <h3>Caratteristiche del nodo</h3>
            {/* PARAMETRI COMUNI */}
            <div className="campo-gruppo">
              <p><b>ID Nodo:</b></p>
              <p className="valore-fisso">{nodoSelezionato.id}</p>
            </div>

            <div className="campo-gruppo">
              <p><b>Posizione X:</b></p>
              <p className="valore-fisso">{Math.round(nodoSelezionato.position.x)}px</p>
            </div>

            <div className="campo-gruppo">
              <p><b>Posizione Y:</b></p>
              <p className="valore-fisso">{Math.round(nodoSelezionato.position.y)}px</p>
            </div>
            
            <hr />
            <h3>Parametri Specifici: {nodoSelezionato.id}</h3>

            {/* AGGIUNTA PER IL NODO UNION */}
            {nodoSelezionato.type === 'union' && (
              <div className="campo-gruppo">
                <p><b>Input Streams Connessi:</b></p>
                <div className="lista-connessioni-union">
                  {nodiSorgenteConnessi.length > 0 ? (
                    nodiSorgenteConnessi.map((idSorgente) => (
                      <div key={idSorgente} className="tag-connessione">
                        <span>🔗 {idSorgente}</span>
                      </div>
                    ))
                  ) : (
                    <p className="testo-avviso">Nessun input collegato.</p>
                  )}
                </div>
              </div>
            )}

            {campiFinali.map((campo) => (
              <div key={campo.key} className="campo-gruppo">
                <p><b>{campo.label}:</b></p>

                {/* 1. SELECT */}
                {campo.tipo === "select" && (
                  <select
                    value={nodoSelezionato.data[campo.key] || ""}
                    onChange={(e) => aggiornaDatoNodo(campo.key, e.target.value)}
                  >
                    <option value="">Seleziona...</option>
                    {campo.opzioni.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}

                {/* 2. FISSO */}
                {campo.tipo === "fisso" && <p className="valore-fisso">{campo.default}</p>}

                {/* 3. ARRAY DI STRINGHE (MAP / KEYBY) */}
                {campo.tipo === "array_stringhe" && (
                  <div className="lista-dinamica">
                    {(nodoSelezionato.data[campo.key] || [""]).map((valore, indice) => (
                      <div key={indice} className="riga-input">
                        <input
                          placeholder={campo.placeholder}
                          value={valore}
                          onChange={(e) => gestisciArrayStringhe(campo.key, "MODIFICA", indice, e.target.value)}
                        />
                        <button title='Rimuovi campo' className='btn-azione btn-rimuovi' onClick={() => gestisciArrayStringhe(campo.key, "RIMUOVI", indice)}>x</button>
                      </div>
                    ))}
                    <button title='Aggiungi campo' className='btn-azione btn-aggiungi' onClick={() => gestisciArrayStringhe(campo.key, "AGGIUNGI")}>+ Aggiungi</button>
                  </div>
                )}

                {/* 4. DIZIONARIO AGGREGAZIONI (AGGREGATE) */}
                {campo.tipo === "dizionario_aggregazioni" && (
                  <div className="lista-aggregazioni">
                    {(nodoSelezionato.data[campo.key] || [{ field: "", op: "min" }]).map((item, indice) => (
                      <div key={indice} className="riga-aggregazione">
                        <input
                          placeholder={campo.placeholder}
                          value={item.field}
                          onChange={(e) => gestisciDizionarioAggregazioni(campo.key, "MODIFICA", indice, "field", e.target.value)}
                        />
                        <select
                          value={item.op}
                          onChange={(e) => gestisciDizionarioAggregazioni(campo.key, "MODIFICA", indice, "op", e.target.value)}
                        >
                          {campo.funzioni.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                        </select>
                        <button title='Rimuovi attributo' className='btn-azione btn-rimuovi' onClick={() => gestisciDizionarioAggregazioni(campo.key, "RIMUOVI", indice)}>x</button>
                      </div>
                    ))}
                    <button title='Aggiungi attributo' className='btn-azione btn-aggiungi' onClick={() => gestisciDizionarioAggregazioni(campo.key, "AGGIUNGI")}>+ Aggiungi</button>
                  </div>
                )}

                {/* 5. DEFAULT (TESTO/NUMERO) */}
                {["testo", "numero"].includes(campo.tipo) && (
                  <input
                    placeholder={campo.placeholder}
                    type={campo.tipo === "numero" ? "number" : "text"}
                    value={nodoSelezionato.data[campo.key] || ""}
                    onChange={(e) => aggiornaDatoNodo(campo.key, e.target.value)}
                  />
                )}
              </div>
            ))}
            <hr style={{width: '100%', color: 'none', border: 'none'}}></hr>
          </div>
        )}
      </aside>
        
      </div>

    </>
    
  );
}

function Workflow() {
  return (
    <ReactFlowProvider>
      <Navbar></Navbar>
      <WorkflowEditor></WorkflowEditor>
    </ReactFlowProvider>
  );
}

export default Workflow;