import { useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Position, Handle, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import Navbar from './components/Navbar';
import { useWorkflow } from './WorkflowContext';
import '@xyflow/react/dist/style.css';
import '../src/css/Workflow.css';


const Source = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FF0000', '--colore-bordo-sinistra': '15px solid #FF0000', '--colore-selezione': '#FF0000'}}>
    <div style={{fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle position={Position.Right} style={{ background: '#FF0000'}}/>
  </div>
);

const Filter = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FFD700', '--colore-bordo-sinistra': '15px solid #FFA500', '--colore-selezione': '#FFA500'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFA500'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#FFA500'}}/>
  </div>
);

const Map = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FFFF00', '--colore-bordo-sinistra': '15px solid #FFFF00', '--colore-selezione': '#FFFF00'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFFF00'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#FFFF00'}}/>
  </div>
);

const KeyBy = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#3CB371', '--colore-bordo-sinistra': '15px solid #3CB371', '--colore-selezione': '#3CB371'}}>
    <Handle type="target" position={Position.Left} style={{background: '#3CB371'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#3CB371'}}/>
  </div>
);

const Window = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#0000FF', '--colore-bordo-sinistra': '15px solid #0000FF', '--colore-selezione': '#0000FF'}}>
    <Handle type="target" position={Position.Left} style={{background: '#0000FF'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#0000FF'}}/>
  </div>
);


const Aggregate = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#800080', '--colore-bordo-sinistra': '15px solid #800080', '--colore-selezione': '#800080'}}>
    <Handle type="target" position={Position.Left} style={{background: '#800080'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#800080'}}/>
  </div>
);


const Sink = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#8B4513', '--colore-bordo-sinistra': '15px solid #8B4513', '--colore-selezione': '#8B4513'}}>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="target" position={Position.Left} style={{background: '#8B4513'}}></Handle>
  </div>
);

const BlocchiIniziali = []

const Associazioni = []

const TipoNodi = {
  source: Source,
  filter: Filter,
  sink: Sink,
  map: Map,
  keyby: KeyBy,
  window: Window,
  aggregate: Aggregate
};

const contatoriTipi = {
  source: 0,
  filter: 0,
  sink: 0,
  map: 0,
  keyby: 0,
  window: 0,
  aggregate: 0
};

const generaNuovoIdPerTipo = (tipo) => {
  if (!(tipo in contatoriTipi)) {
    contatoriTipi[tipo] = 0;
  }
  contatoriTipi[tipo]++;
  return `${tipo}_${contatoriTipi[tipo]}`;
};


const SCHEMA_PROPRIETA = {
  source: [
    { label: "Type", key: "type", tipo: "fisso", default: "kafka"  },
    { label: "Topic", key: "topic", tipo: "testo", placeholder: "Scrivi campo..." },
    { label: "Bootstrap Servers", key: "bootstrap_servers", tipo: "testo", placeholder: "Scrivi campo..." },
    { label: "Timestamp Field", key: "timestamp_field", tipo: "testo", placeholder: "Scrivi qui..."}
  ],
  filter: [
    { 
      label: "Filter Condition",
      key: "filter_condition",
      tipo: "testo",
      placeholder: "Inserisci condizione..."
    }
  ],
  map: [
    {
      label: "Applies To Fields",
      key: "appliesToFields",
      tipo: "array_stringhe",
      placeholder: "Aggiungi campo..."
    }
  ],
  keyby: [
    {
      label: "Applies To Fields",
      key: "appliesToFields", 
      tipo: "testo", 
      placeholder: "Scrivi campo..."
    }
  ],
  window: {
    comuni: [
      { label: "Window Type", key: "windowType", tipo: "select", opzioni: ["tumbling", "hopping", "count"] }
    ],
    specifici: {
      tumbling: [
        { label: "Duration", key: "duration", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Size", key: "size", tipo: "numero", placeholder: "Inserisci numero intero..." }
      ],
      hopping: [
        { label: "Duration", key: "duration", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Slide", key: "slide", tipo: "numero", placeholder: "Inserisci numero intero..."}
      ],
      count: [
        { label: "Size", key: "size", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Slide", key: "slide", tipo: "numero", placeholder: "Inserisci numero intero" }
      ]
    }
  },
  aggregate: [
    { label: "Aggregazioni", key: "aggregations", tipo: "dizionario_aggregazioni", funzioni: ["min", "max", "avg", "sum"] }
  ],
  sink: [
    { label: "Type", key: "type", tipo: "fisso", default: "kafka"  },
    { label: "Topic", key: "topic", tipo: "testo", placeholder: "Scrivi campo..." },
    { label: "Bootstrap Servers", key: "bootstrap_servers", tipo: "testo", placeholder: "Scrivi campo..." },
  ]
};


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

const nodoSelezionato = blocchi.find((blocco) => blocco.selected === true)

const AggiornaBlocchi = useCallback(
  (changes) => SettaBlocchi((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
  [],
);
const AggiornaCollegamenti = useCallback(
  (changes) => SettaCollegamenti((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
  [],
);

const Associa = useCallback(
  (params) => SettaCollegamenti((edgesSnapshot) => addEdge(params, edgesSnapshot)),
  [],
);

const aggiornaDatoNodo = (chiave, valore) => {
  // 1. Usiamo la funzione SettaBlocchi che arriva dal Context
  SettaBlocchi((vecchiBlocchi) =>
    vecchiBlocchi.map((nodo) => {
      // 2. Cerchiamo il nodo che l'utente sta modificando nella sidebar
      if (nodo.id === nodoSelezionato.id) {
        return {
          ...nodo,
          data: {
            ...nodo.data,    // Mantieni i dati esistenti (es. label)
            [chiave]: valore // Aggiorna o aggiungi la nuova proprietà (es. topic: "A")
          },
        };
      }
      // 3. Gli altri nodi rimangono invariati
      return nodo;
    })
  );
};

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
        <hr></hr>
        {!nodoSelezionato ?
         (
          <p style={{fontFamily: 'Courier New, Courier, monospace', marginTop: '40px', fontSize: 'large'}}><b>Seleziona un blocco per vederne i parametri.</b></p>
         ) :
         (
          <div style={{display: 'flex', flexDirection: 'column', gap: '40px', fontFamily: 'Courier New, Courier, monospace', fontSize: 'large'}}>
            <h3 style={{marginTop: '40px', textAlign: 'center'}}> Caratteristiche del nodo </h3>
            <div>
              <label><b>ID:</b></label>
                <p style={{textAlign: 'center'}} className='blocco-gestione'>{nodoSelezionato.id}</p>
            </div>
            <div>
              <label><b>Position X:</b></label>
                <p style={{textAlign: 'center'}} className='blocco-gestione'>{Math.round(nodoSelezionato.position.x)}</p>
            </div>
            <div>
              <label><b>Position Y:</b></label>
                <p style={{textAlign: 'center'}} className='blocco-gestione'>{Math.round(nodoSelezionato.position.y)}</p>
            </div>
            <hr/>
            <h3 style={{textAlign: 'center'}}> Caratteristiche proprie del nodo {nodoSelezionato.id}</h3>
            <hr style={{width: '100%', color: 'none', border: 'none'}}></hr>

            {SCHEMA_PROPRIETA[nodoSelezionato.type] && Array.isArray(SCHEMA_PROPRIETA[nodoSelezionato.type]) && (
              SCHEMA_PROPRIETA[nodoSelezionato.type].map((campo) => (
                <div key={campo.key} style={{ marginBottom: '15px' }}>
                  <p><b>{campo.label}:</b></p>
                  {campo.tipo === "fisso" ? (
                    /* Se è fisso, mostro il valore di default */
                    <p className='blocco-gestione'>{campo.default}</p>
                  ) : (
                    /* Se è testo, mostro un input collegato allo stato del nodo */
                    <input
                      style={{width: '250px', height: '25px', fontSize: 'large'}}
                      placeholder='Scrivi qui...'
                      value={nodoSelezionato.data[campo.key] || ""} 
                      onChange={(e) => aggiornaDatoNodo(campo.key, e.target.value)}
                    />
                  )}
                </div>
              ))
            )}
            <hr style={{width: '100%', color: 'none', border: 'none'}}></hr>
          </div>


         )
        }
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