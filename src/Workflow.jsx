import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Position, Handle, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import Navbar from './components/Navbar';
import { useWorkflow } from './WorkflowContext';
import '../src/css/Workflow.css';
import '@xyflow/react/dist/style.css';



const SingoloInput = ({data}) => (
  <div>
    {data.label}
    <Handle position={Position.Right} style={{ background: '#0000FF'}}/>
  </div>
);

const SingoloInputSingoloOutput = ({data}) => (
  <div>
    <Handle type="target" position={Position.Left} style={{background: '#00FF00'}}/>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#00FF00'}}/>
  </div>
);


const Output = ({data}) => (
  <div>
    {data.label}
    <Handle type="target" position={Position.Left} style={{background: '	#800000'}}></Handle>
  </div>
)

const NodoTesto = ({ data }) => {
  // Funzione per gestire il cambiamento del testo se vuoi salvare i dati
  const onChange = (evt) => {
    if (data.onChange) data.onChange(evt.target.value);
  };

  return (
    <div className="nodo-testo-custom">
      {/* Handle di SINISTRA (Target) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#FF0000', width: '8px', height: '8px' }}
      />

      {/* Area di trascinamento (Maniglia) */}
      <div className="drag-handle">
        <div className="dots">:::</div>
      </div>
      
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Scrivi qui..." 
          onChange={onChange}
          className='nodrag'
        />
      </div>

      {/* Handle di DESTRA (Source) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#FF0000', width: '8px', height: '8px' }}
      />
    </div>
  );
};


const BlocchiIniziali = []

const Associazioni = []

const TipoNodi = {
  input: SingoloInput,
  default: SingoloInputSingoloOutput,
  testo: NodoTesto,
  output: Output,
};

let idContatore = 0;
const generaNuovoId = () => `nodo_${idContatore++}`;


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

      // Creiamo il nuovo oggetto nodo
      const nuovoNodo = {
        id: generaNuovoId(), 
        type: tipo,
        position: posizione,
        data: { label: `Blocco ${idContatore}` },
      };

      SettaBlocchi((nds) => nds.concat(nuovoNodo));
    },
    [screenToFlowPosition]
  );

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
          >
          <Background variant="dots" gap={12} size={1} />
          <Controls className={`sposta-controlli ${SidebarAperta ? 'aperta' : ''}`}
          />
          <MiniMap
            className={`sposta-minimappa ${GestioneAperta ? 'aperta' : ''}`}
            maskColor='orange' nodeColor='black' color='orange' bgColor='orange' ariaLabel='Mappa del flusso'></MiniMap>
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

          {/* Blocco Sorgente */}
          <div 
            className="blocco-sidebar" 
            onDragStart={(event) => InizioTrascinamento(event, 'input')} 
            draggable
          >
            <span>🔵</span> 
            <span style={{ marginLeft: '10px' }}>Nodo con solo input</span>
          </div>

          {/* Blocco con input e output */}
          <div 
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#4caf50' }}
            onDragStart={(event) => InizioTrascinamento(event, 'default')} 
            draggable
          >
            <span>🟢</span>
            <span style={{ marginLeft: '10px' }}>Nodo con input e output</span>
          </div>
          {/* Blocco con solo output */}
          <div 
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#800000' }}
            onDragStart={(event) => InizioTrascinamento(event, 'output')} 
            draggable
          >
            <span>🟤</span>
            <span style={{ marginLeft: '10px' }}>Nodo con solo output</span>
          </div>
          {/* Blocco con inserimento testo */}
          <div 
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FF0000' }}
            onDragStart={(event) => InizioTrascinamento(event, 'testo')} 
            draggable
          >
            <span>🔴</span>
            <span style={{ marginLeft: '10px' }}>Nodo testuale</span>
          </div>
  
        </div>
        </aside>

        {/* Di seguito c'è il codice che riguarda la sidebar di destra */}
        <aside className={`sidebar-gestione ${GestioneAperta ? 'visibile' : ''}`}>
        <h3>Menù gestione blocchi</h3>
        <hr></hr>
        

        <div>


        </div>
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