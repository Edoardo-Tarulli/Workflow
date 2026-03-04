
/*Andiamo ad inserire gli input necessari per il funzionamento, in particolare
importiamo Handle e Position che ci serviranno per impostare la posizione delle maniglie
relative ad ogni singolo blocco che comparirà poi nel workflow e naturalmente
il foglio di stile css
*/

import { Handle, Position } from '@xyflow/react';
import '../css/CustomNodes.css'


// Questo è il nodo source, da cui si parte e che ha solo output quindi verso i blocchi successivi
export const Source = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FF0000', '--colore-bordo-sinistra': '15px solid #FF0000', '--colore-selezione': '#FF0000'}}>
    <div style={{fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle position={Position.Right} style={{ background: '#FF0000'}}/>
  </div>
);

/*
Da qui fino all'ultimo blocco eslcuso, cioè sink, sono definiti tutti blocchi che hanno
due maniglie, una di input e una di output, e un colore univoco che li contraddistingue
*/

export const Filter = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FFD700', '--colore-bordo-sinistra': '15px solid #FFA500', '--colore-selezione': '#FFA500'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFA500'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#FFA500'}}/>
  </div>
);

export const Map = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#FFFF00', '--colore-bordo-sinistra': '15px solid #FFFF00', '--colore-selezione': '#FFFF00'}}>
    <Handle type="target" position={Position.Left} style={{background: '#FFFF00'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#FFFF00'}}/>
  </div>
);

export const KeyBy = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#3CB371', '--colore-bordo-sinistra': '15px solid #3CB371', '--colore-selezione': '#3CB371'}}>
    <Handle type="target" position={Position.Left} style={{background: '#3CB371'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#3CB371'}}/>
  </div>
);

export const Window = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#0000FF', '--colore-bordo-sinistra': '15px solid #0000FF', '--colore-selezione': '#0000FF'}}>
    <Handle type="target" position={Position.Left} style={{background: '#0000FF'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#0000FF'}}/>
  </div>
);


export const Aggregate = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#800080', '--colore-bordo-sinistra': '15px solid #800080', '--colore-selezione': '#800080'}}>
    <Handle type="target" position={Position.Left} style={{background: '#800080'}}/>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="source" position={Position.Right} style={{background: '#800080'}}/>
  </div>
);

// Questo è il nodo Sink, cioè quello di arrivo, che appunto ha una maniglia solo in ingresso. 
export const Sink = ({data}) => (
  <div tabIndex={0} className='stileNodo' style={{color: '#8B4513', '--colore-bordo-sinistra': '15px solid #8B4513', '--colore-selezione': '#8B4513'}}>
    <div style={{ fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle type="target" position={Position.Left} style={{background: '#8B4513'}}></Handle>
  </div>
);

// Andiamo ad esportare la funzione TipoNodi, che ci permette di settare il tipo personalizzato di nodo
export const TipoNodi = {
  source: Source,
  filter: Filter,
  sink: Sink,
  map: Map,
  keyby: KeyBy,
  window: Window,
  aggregate: Aggregate
};