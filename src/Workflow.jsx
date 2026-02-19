import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Position, Handle, MiniMap, Panel, ReactFlowProvider, useReactFlow} from '@xyflow/react';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import Navbar from './components/Navbar';
import { useWorkflow } from './WorkflowContext';
import '@xyflow/react/dist/style.css';
import '../src/css/Workflow.css';


const SingoloInput = ({data}) => (
  <div id = 'nodo_input' style={{color: 'blue'}}>
    {data.label}
    <Handle position={Position.Right} style={{ background: 'blue'}}/>
  </div>
);

const SingoloInputSingoloOutput = ({data}) => (
  <div id = 'nodo_inputoutput' style={{color: '#4caf50'}}>
    <Handle type="target" position={Position.Left} style={{background: '#4caf50'}}/>
    {data.label}
    <Handle type="source" position={Position.Right} style={{background: '#4caf50'}}/>
  </div>
);


const Output = ({data}) => (
  <div id = 'ciao' style={{color: '#8B4513'}}>
    {data.label}
    <Handle type="target" position={Position.Left} style={{background: '#8B4513'}}></Handle>
  </div>
)

const NodoTesto = ({ data }) => {
  // Funzione per gestire il cambiamento del testo per salvare i dati
  const onChange = (evt) => {
    if (data.onChange) data.onChange(evt.target.value);
  };

  return (
    <div id = 'nodo_testo' className="nodo-testo-custom">
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

const NodoMerge = ({data}) => (
  <div id = 'nodo_merge' className='nodo-merge'>
    <Handle type="target" position={Position.Left} style={{background: '#FFFF00'}}/>
    <Handle type="source" position={Position.Right} style={{background: '#FFFF00'}}/>
  </div>

)


const BlocchiIniziali = []

const Associazioni = []

const TipoNodi = {
  input: SingoloInput,
  default: SingoloInputSingoloOutput,
  testo: NodoTesto,
  output: Output,
  merge: NodoMerge,
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
            aria-label='Ciao'
            showZoom showFitView
            
          />
          <MiniMap
            className={`sposta-minimappa ${GestioneAperta ? 'aperta' : ''}`}
            nodeColor='black' ariaLabel='Mappa del flusso' bgColor='#AFEEEE' maskColor='none' pannable: false zoomable: false></MiniMap>
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
          <div id = 'input'
            className="blocco-sidebar"
            style={{ borderLeftColor: 'blue' }}
            onDragStart={(event) => InizioTrascinamento(event, 'input')} 
            draggable
          >
            <span>🔵</span> 
            <span style={{ marginLeft: '10px' }}><b>Nodo con solo input</b></span>
          </div>

          {/* Blocco con input e output */}
          <div id = 'inputoutput'
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#4caf50' }}
            onDragStart={(event) => InizioTrascinamento(event, 'default')} 
            draggable
          >
            <span>🟢</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo con input e output</b></span>
          </div>
          {/* Blocco con solo output */}
          <div id = 'output'
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#8B4513' }}
            onDragStart={(event) => InizioTrascinamento(event, 'output')} 
            draggable
          >
            <span>🟤</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo con solo output</b></span>
          </div>
          {/* Blocco con inserimento testo */}
          <div id = 'text'
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FF0000' }}
            onDragStart={(event) => InizioTrascinamento(event, 'testo')} 
            draggable
          >
            <span>🔴</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo testuale</b></span>
          </div>
          {/* Blocco merge */}
          <div id = 'merge'
            className="blocco-sidebar" 
            style={{ borderLeftColor: '#FFFF00' }}
            onDragStart={(event) => InizioTrascinamento(event, 'merge')} 
            draggable
          >
            <span>🟡</span>
            <span style={{ marginLeft: '10px' }}><b>Nodo merge</b></span>
          </div>
  
        </div>
        </aside>

        {/* Di seguito c'è il codice che riguarda la sidebar di destra */}
        <aside className={`sidebar-gestione ${GestioneAperta ? 'visibile' : ''}`}>
        <h3>Menù gestione blocchi</h3>
        <hr></hr>
        {nodoSelezionato ? (
          <div className="proprieta-nodo">
            <p className='proprietà-paragrafo-nodo'><strong>ID:</strong> {nodoSelezionato.id}</p>
            <p className='proprietà-paragrafo-nodo'><strong>Tipo:</strong> {nodoSelezionato.type}</p>
      
            <div className="coordinate">
              <p className='proprietà-paragrafo-nodo'><strong>Posizione X:</strong> {Math.round(nodoSelezionato.position.x)}</p>
              <br></br>
              <p className='proprietà-paragrafo-nodo'><strong>Posizione Y:</strong> {Math.round(nodoSelezionato.position.y)}</p>
            </div>

            <div className="dati-custom">
              <p className='proprietà-paragrafo-nodo'><strong>Label:</strong> {nodoSelezionato.data.label}</p>
            </div>

            {/*input per modificare la label in tempo reale */}
            <label>Titolo (Label):</label>
            <input 
              type="text"
              className='input-label'
              value={nodoSelezionato.data.label || ''}
              maxLength={25} 
              onChange={(evt) => {
                const nuovaLabel = evt.target.value;
                SettaBlocchi((nds) =>
                  nds.map((node) =>
                    node.id === nodoSelezionato.id
                      ? { ...node, data: { ...node.data, label: nuovaLabel } }
                      : node
                  )
                );
              }}
            />

            <label style={{ marginTop: '15px', display: 'block' }}>Descrizione:</label>
            <textarea 
              className="textarea-descrizione"
              placeholder="Aggiungi una descrizione..."
              value={nodoSelezionato.data.description || ''}
              onChange={(evt) => {
                const nuovaDesc = evt.target.value;
                SettaBlocchi((nds) =>
                  nds.map((node) =>
                    node.id === nodoSelezionato.id
                      ? { ...node, data: { ...node.data, description: nuovaDesc } }
                      : node ) ); } } />
          </div>          
  ) : (
    <p className="placeholder-text">Seleziona un blocco per vederne le proprietà</p>
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