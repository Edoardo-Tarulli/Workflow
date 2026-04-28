import { useCallback, useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import Navbar from './components/Navbar';
import { Properties } from './data/Properties';
import { useWorkflowActions } from './hooks/useWorkflowActions';
import { getCampiFinali, calcolaNuovoId, connessioneValida, calcolaErroriValidazione, gestisciEsportazione, gestisciImportazione} from './utils/workflowHelpers';
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

  // Passiamo i parametri necessari all'hook delle azioni
  const actions = useWorkflowActions(
    SettaBlocchi, 
    SettaCollegamenti, 
    nodoSelezionato?.id, 
    blocchi, 
    screenToFlowPosition
  );

  const { 
  aggiornaDatoNodo, 
  gestisciArrayStringhe, 
  gestisciDizionarioAggregazioni,
  InizioTrascinamento,
  SopraWorkflow,
  AlRilascio
  } = actions;

  const campiFinali = getCampiFinali(nodoSelezionato, Properties);

  // Memorizziamo gli errori chiamando l'helper
  const erroriValidazione = useMemo(() => 
    calcolaErroriValidazione(blocchi, collegamenti), 
  [blocchi, collegamenti]);

  // Gestione validazione connessione
  const onConnectValid = useCallback((conn) => 
    connessioneValida(conn, blocchi, collegamenti, SettaMessaggioErrore),
  [blocchi, collegamenti]);

  // Nodi sorgente per UNION
  const nodiSorgenteConnessi = (nodoSelezionato?.type === 'union') 
  ? collegamenti
      .filter((edge) => edge.target === nodoSelezionato.id)
      .map((edge) => edge.source) // Prendiamo l'ID del nodo di origine
  : [];

/*
Inizio del return che ci restituisce la nostra pagina workflow
con tutte le sue caratteristiche.
*/

  return (
    <>
      <div className={`stile-div-workflow ${ModalitaDark ? 'dark-mode' : ''}`}>

        {/* Messaggio di avviso a schermo quando si prova a collegare più nodi ad un nodo che non è di tipo union. */}
        {messaggioErrore && (
          <div className="toast-errore-workflow">
            <span>⚠️ {messaggioErrore}</span>
          </div>
        )}

        <ReactFlow
          nodes = {blocchi}
          edges = {collegamenti}
          onNodesChange = {actions.AggiornaBlocchi}
          onEdgesChange = {actions.AggiornaCollegamenti}
          onConnect = {actions.Associa}
          onDragStart = {actions.InizioTrascinamento}
          onDrop={actions.AlRilascio}
          onDragOver={actions.SopraWorkflow}
          nodeTypes={TipoNodi}
          fitView
          colorMode={ModalitaDark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: true }} // serve per nascondere il link al sito React Flow in basso a destra che compare di default
          isValidConnection={onConnectValid}
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
              onChange={(event) => gestisciImportazione(event, SettaBlocchi, SettaCollegamenti, SettaMessaggioErrore)}
              style={{display: 'none'}}
            />  
            {/* Pulsante SALVA BOZZA (Sempre attivo), per salvare la bozza anche con errori */}
            <button 
              className="btn-workflow bozza" 
              onClick={() => gestisciEsportazione(true, blocchi, collegamenti, erroriValidazione, SettaMessaggioErrore)}
              title="Salva bozza (anche con errori)">
              💾 Salva Bozza
            </button>

            {/* Pulsante Esporta, che è disabilitato fino a che non vengono risolti tutti gli errori */}
            <button 
              className={`btn-workflow esporta ${erroriValidazione.length > 0 ? 'disabilitato' : ''}`}
              onClick={() => gestisciEsportazione(false, blocchi, collegamenti, erroriValidazione, SettaMessaggioErrore)}
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
              onChange={(e) => gestisciImportazione(e, SettaBlocchi, SettaCollegamenti)}
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
            onDragStart={(event) => InizioTrascinamento(event, 'source')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Source"</b></span>
          </div>

          {/* Blocco Filter (filtraggio) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'filter')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Filter"</b></span>
          </div>

          {/* Blocco Map (mapping) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'map')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Map"</b></span>
          </div>

          {/* Blocco KeyBy (si va a filtrare i campi del nodo) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'keyby')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "KeyBy"</b></span>
          </div>

          {/* Blocco Window (finestra) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'window')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Window"</b></span>
          </div>

          {/* Blocco Aggregate (aggregazione) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'aggregate')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Aggregate"</b></span>
          </div>

          {/* Blocco Union (unione di due o più nodi) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'union')} 
            draggable
          >
            <div className="punto-colore"></div>
            <span style={{marginLeft: '15px'}}><b>Nodo "Union"</b></span>
          </div>

          {/* Blocco Sink (output) */}
          <div
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'sink')} 
            draggable
          >
            <div className="punto-colore"></div>
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