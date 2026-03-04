import { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
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

  const { screenToFlowPosition } = useReactFlow();
  const nodoSelezionato = blocchi.find((blocco) => blocco.selected === true)
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

      // Calcoliamo la posizione corretta nel workflow
      const posizione = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nuovoId = generaNuovoIdPerTipo(tipo);

      // Creiamo il nuovo oggetto nodo
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

  return (
    <>
      <div className={`StileDivWorkflow ${ModalitaDark ? 'dark-mode' : ''}`}>

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
            <span>🔴</span> 
            <span style={{ marginLeft: '10px' }}><b>Nodo "Source"</b></span>
          </div>

          {/* Blocco Filter (filtraggio) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FFA500', '--colore-hover': '#FFA500' }}
            onDragStart={(event) => InizioTrascinamento(event, 'filter')} 
            draggable
          >
            <span>🟠</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "Filter"</b></span>
          </div>

          {/* Blocco Map (mapping) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FFFF00', '--colore-hover': '#FFFF00' }}
            onDragStart={(event) => InizioTrascinamento(event, 'map')} 
            draggable
          >
            <span>🟡</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "Map"</b></span>
          </div>

          {/* Blocco KeyBy (si va a filtrare per chiave) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#3CB371', '--colore-hover': '#3CB371' }}
            onDragStart={(event) => InizioTrascinamento(event, 'keyby')} 
            draggable
          >
            <span>🟢</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "KeyBy"</b></span>
          </div>

          {/* Blocco Window (finestra) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#0000FF', '--colore-hover': '#0000FF' }}
            onDragStart={(event) => InizioTrascinamento(event, 'window')} 
            draggable
          >
            <span>🔵</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "Window"</b></span>
          </div>

          {/* Blocco Aggregate (aggregazione) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#800080', '--colore-hover': '#800080' }}
            onDragStart={(event) => InizioTrascinamento(event, 'aggregate')} 
            draggable
          >
            <span>🟣</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "Aggregate"</b></span>
          </div>

          {/* Blocco Sink (output) */}
          <div
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#8B4513', '--colore-hover': '#8B4513' }}
            onDragStart={(event) => InizioTrascinamento(event, 'sink')} 
            draggable
          >
            <span>🟤</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo "Sink"</b></span>
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
                        <button className='btn-azione btn-rimuovi' onClick={() => gestisciArrayStringhe(campo.key, "RIMUOVI", indice)}>x</button>
                      </div>
                    ))}
                    <button className='btn-azione btn-aggiungi' onClick={() => gestisciArrayStringhe(campo.key, "AGGIUNGI")}>+ Aggiungi</button>
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
                        <button className='btn-azione btn-rimuovi' onClick={() => gestisciDizionarioAggregazioni(campo.key, "RIMUOVI", indice)}>x</button>
                      </div>
                    ))}
                    <button className='btn-azione btn-aggiungi' onClick={() => gestisciDizionarioAggregazioni(campo.key, "AGGIUNGI")}>+ Aggiungi</button>
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