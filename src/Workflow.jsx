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
  <div className='stileNodo' style={{color: '#FF0000', border: '2px solid #FF0000'}}>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle position={Position.Right} style={{ background: '#FF0000'}}/>
  </div>
);

const Filter = ({data}) => (
  <div className='stileNodo' style={{color: '#FFA500', border: '2px solid #FFA500'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFA500'}}/>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#FFA500'}}/>
  </div>
);

const Map = ({data}) => (
  <div className='stileNodo' style={{color: '#FFFF00', border: '2px solid #FFFF00'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFFF00'}}/>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#FFFF00'}}/>
  </div>
);

const KeyBy = ({data}) => (
  <div className='stileNodo' style={{color: '#3CB371', border: '2px solid #3CB371'}}>
    <Handle type="target" position={Position.Left} style={{background: '#3CB371'}}/>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#3CB371'}}/>
  </div>
);

const Window = ({data}) => (
  <div className='stileNodo' style={{color: '#0000FF', border: '2px solid #0000FF'}}>
    <Handle type="target" position={Position.Left} style={{background: '#0000FF'}}/>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#0000FF'}}/>
  </div>
);


const Aggregate = ({data}) => (
  <div className='stileNodo' style={{color: '#800080', border: '2px solid #800080'}}>
    <Handle type="target" position={Position.Left} style={{background: '#800080'}}/>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#800080'}}/>
  </div>
);


const Sink = ({data}) => (
  <div className='stileNodo' style={{color: '#8B4513', border: '2px solid #8B4513'}}>
    <div style={{ fontSize: '10px', fontWeight: 'bold'}}></div>
    {data.label}
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