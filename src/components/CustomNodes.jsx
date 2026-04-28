
/*
Andiamo ad inserire gli input necessari per il funzionamento, in particolare
importiamo Handle e Position che ci serviranno per impostare la posizione delle maniglie
relative ad ogni singolo blocco che comparirà poi nel workflow e naturalmente
il corrispettivo foglio di stile css.
*/

import { Handle, Position } from '@xyflow/react';
import '../css/CustomNodes.css'


// Questo è il nodo source, da cui si parte e che ha solo output, quindi la sua uscita andrà verso blocchi successivi.
export const Source = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <div style={{fontSize: '15px', fontWeight: 'bold'}}>{data.label}</div>
    <Handle position={Position.Right}/>
  </div>
);


// Da qui fino all'ultimo blocco escluso, cioè sink, sono definiti tutti blocchi che hanno due maniglie, una di input e una di output.


export const Filter = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);

export const Map = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);

export const KeyBy = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);

export const Window = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);

export const Aggregate = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);


export const Union = ({ data }) => (
  <div tabIndex={0} className='stile-nodo'>
    <Handle type="target" position={Position.Left}/>
    <div className='descrizione-nodo'>{data.label || 'UNION'}</div>
    <Handle type="source" position={Position.Right}/>
  </div>
);

// Questo è il nodo Sink, cioè quello di arrivo, che ha una maniglia solo in ingresso. 
export const Sink = ({data}) => (
  <div tabIndex={0} className='stile-nodo'>
    <div className='descrizione-nodo'>{data.label}</div>
    <Handle type="target" position={Position.Left}></Handle>
  </div>
);

// Andiamo ad esportare la funzione TipoNodi, che ci permette di settare il tipo personalizzato di nodo.
export const TipoNodi = {
  source: Source,
  filter: Filter,
  sink: Sink,
  map: Map,
  keyby: KeyBy,
  window: Window,
  aggregate: Aggregate,
  union: Union
};