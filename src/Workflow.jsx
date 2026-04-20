import { useCallback, useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import Navbar from './components/Navbar';
import { SCHEMA_PROPRIETA } from './data/schemaProprieta';
import { useWorkflowActions } from './hooks/useWorkflowActions';
import { getCampiFinali, calcolaNuovoId} from './utils/workflowHelpers';
import { useWorkflow } from './WorkflowContext';
import { TipoNodi } from './components/CustomNodes';
import '@xyflow/react/dist/style.css';
import '../src/css/Workflow.css'
import '../src/css/CustomNodes.css';
import '../src/css/ReactFlowTheme.css';


function WorkflowEditor() {

  // Recupera tutto dal Context invece che da useState locali. Sono istanze del Workflow context
  const {
    blocchi, SettaBlocchi,
    collegamenti, SettaCollegamenti,
    SidebarAperta, SettaAperturaSidebar,
    GestioneAperta, SettaGestioneAperta,
    ModalitaDark, SettaModalitaDark
  } = useWorkflow();

  /*
  Queste invece sono locali del file perché tanto le utilizziamo solo nel workflow
  */
  const [messaggioErrore, SettaMessaggioErrore] = useState(null);
  const [mostraErrori, SettaMostraErrori] = useState(false);
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

  // Questa è la funzione che permette il rilascio del nodo sopra il workflow una volta preso dalla liberia blocchi
  const SopraWorkflow = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Azione al rilascio: andiamo a mappare la posizione del nodo sul workflow e nella label comparirà l'id sequenziale in base al tipo di nodo
  // inoltre creiamo l'oggetto nodo con le sue proprietà che poi riprendiamo per l'esportazione della bozza o del JSON.
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

      const nuovoId = calcolaNuovoId(tipo, blocchi);

      // Creiamo il nuovo oggetto nodo, contraddistinto da id, tipo, posizione e data
      const nuovoNodo = {
        id: nuovoId, 
        type: tipo,
        position: posizione,
        data: { label: nuovoId.toUpperCase() },
      };

      SettaBlocchi((nds) => nds.concat(nuovoNodo));
    },
    [screenToFlowPosition, blocchi, SettaBlocchi]
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
troviamo i nodi che sono connessi ad esso. Cosìcche i nodi che sono connessi all'union li andiamo ad inserire nelle 
sue proprietà.
*/

const nodiSorgenteConnessi = (nodoSelezionato?.type === 'union') 
  ? collegamenti
      .filter((edge) => edge.target === nodoSelezionato.id)
      .map((edge) => edge.source) // Prendiamo l'ID del nodo di origine
  : [];


const erroriValidazione = useMemo(() => {
  const lista = [];

  // 1. Regola: Almeno un Source
  if (!blocchi.some(n => n.type === 'source')) {
    lista.push({ tipo: 'globale', msg: "Manca un nodo Source" });
  }

  // 2. Regola: Almeno un Sink
  if (!blocchi.some(n => n.type === 'sink')) {
    lista.push({ tipo: 'globale', msg: "Manca un nodo Sink" });
  }

  // 3. Regola: Union con almeno 2 ingressi
  blocchi.filter(n => n.type === 'union').forEach(u => {
    const numIn = collegamenti.filter(e => e.target === u.id).length;
    if (numIn < 2) {
      lista.push({ tipo: 'nodo', id: u.id, msg: `Il nodo ${u.id} richiede almeno 2 ingressi` });
    }
  });

  // 4. Regola: Nodi non isolati, cioè significa che ogni nodo deve essere collegato ad un altro. 
  blocchi.forEach(nodo => {
    const haCollegamentiInEntrata = collegamenti.some(e => e.target === nodo.id);
    const haCollegamentiInUscita = collegamenti.some(e => e.source === nodo.id);

    // Un nodo è isolato se non ha né entrate né uscite
    if (!haCollegamentiInEntrata && !haCollegamentiInUscita) {
      lista.push({ 
        tipo: 'nodo', 
        id: nodo.id, 
        msg: `Il nodo ${nodo.id} è isolato e deve essere collegato` 
      });
    } 
    // 5. Regola: Ovviamente il nodo Source e Sink devono avere rispettivamente un collegamento in uscita e uno in ingresso, dato che
    // rappresentano i nodi di inizio e fine. 
    else {
      if (nodo.type === 'source' && !haCollegamentiInUscita) {
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo Source (${nodo.id}) non ha collegamenti in uscita` });
      }
      if (nodo.type === 'sink' && !haCollegamentiInEntrata) {
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo Sink (${nodo.id}) non ha collegamenti in ingresso` });
      }
      if (nodo.type !== 'source' && nodo.type !== 'sink' && (!haCollegamentiInEntrata || !haCollegamentiInUscita)) {
        // Se è un nodo intermedio ma gli manca un pezzo della catena
        const manca = !haCollegamentiInEntrata ? "ingresso" : "uscita";
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo ${nodo.id} è incompleto: manca un collegamento in ${manca}` });
      }
    }
  });

  return lista;
}, [blocchi, collegamenti]);


/*
Questa è la funzione che ci consente di andare a trasformare i dati grafici di React Flow, 
quindi nodi e collegamenti, in formato JSON. Viene gestito il fatto che se il workflow non è corretto, viene data la possibilità di esportare
solo la bozza, la quale può contenere anche errori e nel JSON di essa ci saranno anche le posizioni in modo tale che la possiamo importare
nuovamente per continuare a lavorarci. Se invece il workflow non presenta errori allora lo possiamo esportare e rappresenta il workflow
corretto che poi verrà usato su flink quindi contiene solo dati puliti, senza posizioni o altro. 
*/

const gestisciEsportazione = useCallback((isDraft = false) => {
  if (!isDraft && erroriValidazione.length > 0) {
    SettaMessaggioErrore("Impossibile esportare: risolvi prima tutti i problemi nel workflow.");
    setTimeout(() => SettaMessaggioErrore(null), 4000);
    return;
  }

  try {
    const steps = blocchi.map((nodo) => {
      const collegamentiInUscita = collegamenti
        .filter((edge) => edge.source === nodo.id)
        .map((edge) => edge.target);

      const { label, ...datiPuliti } = nodo.data || {};

      // Se non è una bozza, creiamo un oggetto senza la proprietà 'position'
      let stepDati = {
        id: nodo.id,
        type: nodo.type,
        ...datiPuliti,
      };

      if (isDraft) {
        stepDati.position = nodo.position; // Includiamo la posizione solo nella bozza
      }

      if (nodo.type !== 'sink') {
        stepDati.next = collegamentiInUscita;
      } else if (!stepDati.sinkType) {
        stepDati.sinkType = "print"; 
      }

      return stepDati;
    });

    // Serve per generare la data di esportazione solo nel momento in cui il workflow è una bozza 
    const workflowFinale = isDraft 
      ? { steps, status: 'draft', dataEsportazione: new Date().toISOString() } 
      : { steps };

    const dataStr = JSON.stringify(workflowFinale, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const prefix = isDraft ? 'BOZZA_workflow' : 'workflow_flink';
    link.download = `${prefix}_${new Date().toISOString().slice(0,10)}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Messaggio informativo post-esportazione
    if (!isDraft) {
      alert("Esportazione per Flink completata.\n\nNOTA: Questo file è ottimizzato per la produzione e NON contiene le posizioni dei nodi. Per modifiche grafiche future, usa sempre il file 'BOZZA'.");
    }
  } catch (error) {
    console.error("Errore durante l'esportazione:", error);
  }
}, [blocchi, collegamenti, erroriValidazione]);


/*
Funzione per la gestione dell'importazione di un JSON da file. Naturalmente nella ricerca del file ci vengono mostrati solo
i file che hanno estensione JSON. Nel caso in cui l'utente dovesse importare un workflow già completo e corretto, in esso non ci sonno
le posizioni quindi implementiamo una piccola griglia così da dare comunque una posizione ai nodi, da verificare se funziona correttamente
o sufficientemente bene 
*/

const gestisciImportazione = useCallback((event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.steps) throw new Error("Formato non valido");

      const nuoviNodi = json.steps.map((step, indice) => {
        // Algoritmo di emergenza: Griglia 3xN se manca la posizione
        const xDefault = (indice % 3) * 300; 
        const yDefault = Math.floor(indice / 3) * 200;

        return {
          id: step.id,
          type: step.type,
          position: step.position || { x: xDefault, y: yDefault },
          data: { 
            label: step.id.toUpperCase(),
            ...Object.keys(step)
              .filter(key => !['id', 'type', 'position', 'next'].includes(key))
              .reduce((obj, key) => ({ ...obj, [key]: step[key] }), {})
          },
        };
      });

      const nuoviEdges = [];
      json.steps.forEach((step) => {
        if (step.next && Array.isArray(step.next)) {
          step.next.forEach((targetId) => {
            nuoviEdges.push({
              id: `e-${step.id}-${targetId}`,
              source: step.id,
              target: targetId,
              animated: false, // Così le linee rimangono continue altrimenti, quando reimportiamo, diventano tratteggiate
              style: { strokeWidth: 2 } 
            });
          });
        }
      });

      SettaBlocchi(nuoviNodi);
      SettaCollegamenti(nuoviEdges);
      event.target.value = ''; // Reset input
    } catch (err) {
      SettaMessaggioErrore("Errore nell'importazione del file JSON.");
      setTimeout(() => SettaMessaggioErrore(null), 3000);
    }
  };
  reader.readAsText(file);
}, [SettaBlocchi, SettaCollegamenti]);


/*
Inizio del return che ci restituisce la nostra pagina workflow
con tutte le sue caratteristiche.
*/

  return (
    <>
      <div className={`StileDivWorkflow ${ModalitaDark ? 'dark-mode' : ''}`}>

        {/* Messaggio di avviso a schermo quando si prova a collegare più nodi ad un nodo che non è di tipo union. */}
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
          <Background variant="dots" gap={12} size={1} /> {/*Impostiamo lo sfondo con puntini e distanza tra di loro*/}
          
          {/*Pannello dei controlli (zoom in, out, fitView, Lock) che quando viene aperta la liberia, trasla */}
          <Controls
            className={`sposta-controlli ${SidebarAperta ? 'aperta' : ''}`} 
            showZoom showFitView
          />

          {/*Pannello minimappa che mostra i nodi e quando viene aperta la sidebar di gestione, trasla per non essere sovrapposta*/}
          <MiniMap
            className={`sposta-minimappa ${GestioneAperta ? 'aperta' : ''}`}
            nodeColor='black' ariaLabel='Mappa del flusso' bgColor='#AFEEEE' maskColor='none' pannable={false} zoomable={false}>
          </MiniMap>

          {/*Freccia per aprire la sidebar dei blocchi e trasla quando viene cliccata per non essere sovrapposta*/}
          <Panel position='top-left'>
            <IoIosArrowDroprightCircle
            className={`icona-toggle ${SidebarAperta ? 'aperta' : ''}`}
            onClick={ () => SettaAperturaSidebar(!SidebarAperta)}
            title = 'Apri liberia blocchi'>
            </IoIosArrowDroprightCircle>
          </Panel>

          {/*Pannello dei colori per il cambio tema*/}
          <Panel position='top-center'>
            <FaCircle
            className='IconaCambiaSfondo' 
            title='Cambia Tema'
            onClick={() => SettaModalitaDark(!ModalitaDark)}>
            </FaCircle>
          </Panel>

          {/*Freccia di destra per l'apertura della sidebar dove possiamo stabilire i campi dei nodi*/}
          <Panel position='top-right'>
            <IoIosArrowDropleftCircle
            className={`icona-gestione ${GestioneAperta ? 'aperta' : ''}`}
            onClick={() => SettaGestioneAperta(!GestioneAperta)}
            title = 'Apri menù gestione'>
            </IoIosArrowDropleftCircle>
          </Panel>

          {/*Pannello in basso al centro per le "azioni finali", cioè l'esportazione di bozza/workflow finale completo*/}
          <Panel position='bottom-center' className="panel-azioni-finali">
            <input
              type='file'
              id='file-import'
              accept='.json'
              onChange={gestisciImportazione}
              style={{display: 'none'}}
            />  
            {/* Pulsante SALVA BOZZA (Sempre attivo), per salvare la bozza anche con errori */}
            <button 
              className="btn-workflow bozza" 
              onClick={() => gestisciEsportazione(true)}
              title="Salva bozza (anche con errori)">
              💾 Salva Bozza
            </button>

            {/* Pulsante Esporta, che è disabilitato fino a che non vengono risolti tutti gli errori */}
            <button 
              className={`btn-workflow esporta ${erroriValidazione.length > 0 ? 'disabilitato' : ''}`}
              onClick={() => gestisciEsportazione(false)}
              title={erroriValidazione.length > 0 ? "Risolvi gli errori per esportare" : "Esporta workflow finale"}>
              🚀 Esporta JSON
            </button>

          </Panel>
          {/* Pannello Warning che trasla se la sidebar gestione viene aperta così da non essere sovrapposta. Se viene cliccato si apre il pannello
          che contiene gli errori presenti e dinamicamente vengono rimossi se risolti */}
          {erroriValidazione.length > 0 && (
            <Panel className={`sposta-contenitore-warning ${GestioneAperta ? 'aperta' : ''}`} position="top-right" style={{ marginTop: '70px' }}>
              
              <div className="container-warning-workflow">
                
                {/* Triangolo Giallo: Clicca per aprire/chiudere */}
                <div 
                  className="pulsante-warning" 
                  onClick={() => SettaMostraErrori(!mostraErrori)}
                  title="Clicca per vedere i problemi del workflow"
                  style={{ cursor: 'pointer'}}>
                  ⚠️ <span className="contatore-errori">{erroriValidazione.length}</span>
                </div>

                {/* Lista Errori: compare solo se mostraErrori è true, quindi significa che il workflow è "errato" */}
                {mostraErrori && (
                  <div className="popover-lista-errori">
                    <div className="header-popover">
                      <b style={{cursor: 'default'}}>Problemi rilevati:</b>
                      <button onClick={() => SettaMostraErrori(false)} className="btn-chiudi-popover">×</button>
                    </div>
                    <hr />
                    <ul>
                      {erroriValidazione.map((err, i) => (
                        <li style={{cursor: 'default'}} key={i}>{err.msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          )}   
        </ReactFlow>

        {/* Sidebar Laterale */}
        <aside className={`sidebar-blocchi ${SidebarAperta ? 'visibile' : ''}`}>
        <h3 style={{cursor: 'default'}}>Libreria Blocchi</h3>
        <hr></hr>
          {/*Questo è il contenitore dell'import che contiene il bottone cliccabile per scegliere il file*/}
          <div style={{ padding: '0 10px'}}>
            <input
              type="file"
              id="file-import"
              accept=".json"
              onChange={gestisciImportazione}
              style={{ display: 'none' }}
            />
            <button 
              className="btn-workflow importa"
              onClick={() => document.getElementById('file-import').click()}
              title='Importa da file'
            >
              📂 Importa Progetto
            </button>
          </div>
        <p className='testo-vuoto'>Seleziona un nodo e trascinalo nel workflow oppure importa un progetto esistente.</p>

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
        <h3 style={{cursor: 'default'}}>Proprietà</h3>
        <hr />
        {!nodoSelezionato ? (
          <p className="testo-vuoto">Seleziona un blocco per vederne i parametri.</p>
        ) : (
          <div className="container-proprieta">

            <h3 style={{cursor: 'default'}}>Caratteristiche del nodo</h3>
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
            <h3 style={{cursor: 'default'}}>Parametri Specifici: {nodoSelezionato.id}</h3>

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