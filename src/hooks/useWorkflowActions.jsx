
/* Gli import sono gli hook nativi di react che permettono di aggiungere collegamenti ed applicarli tra un nodo e l'altro e la funzione
di callback che permette di restituirci il blocco/collegamento aggiornato */
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { useCallback } from 'react';
import { calcolaNuovoId } from '../utils/workflowHelpers';

export const useWorkflowActions = (SettaBlocchi, SettaCollegamenti, nodoSelezionatoId, blocchi, screenToFlowPosition) => {
  
  // --- FUNZIONI STANDARD REACT FLOW ---

  // Ci permette di aggiornare il blocco e salvarlo in SettaBlocchi
  const AggiornaBlocchi = useCallback(
    (changes) => SettaBlocchi((nds) => applyNodeChanges(changes, nds)),
    [SettaBlocchi]
  );

  // Ci permette di aggiornare i collegamenti e salvarli in SettaCollegamenti
  const AggiornaCollegamenti = useCallback(
    (changes) => SettaCollegamenti((eds) => applyEdgeChanges(changes, eds)),
    [SettaCollegamenti]
  );

  // Ci permette di collegare un nodo all'altro
  const Associa = useCallback(
    (params) => SettaCollegamenti((eds) => addEdge(params, eds)),
    [SettaCollegamenti]
  );

  // --- GESTIONE DRAG E DROP ---
  
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
Ci permette di aggiornare i dati del nodo. In particolar modo andiamo a scorrere tutti i blocchi e quando l'id del nodo
corrisponde all'id del nodo selezionato allora salva i dati delle modifiche apportate (input inseriti etc) altrimenti lo lascia invariato
*/

// -- AGGIORNAMENTO DATI --

const aggiornaDatoNodo = (chiave, valore) => {
    SettaBlocchi((nds) => nds.map((n) => 
      n.id === nodoSelezionatoId ? { ...n, data: { ...n.data, [chiave]: valore } } : n
    ));
  };

  /*
  Questa è la funzione che ci permette di gestire l'array di stringhe del nodo map. In particolar modo,
  andiamo a scorrere tutti i blocchi fino a trovare quello selezionato tramite l'id e quando lo trova, se non esiste un array lo crea, altrimenti
  lo va a popolare come chiave-valore in base all'azione fatta (modifica il valore, aggiungi un campo o lo rimuovi) 
  */

const gestisciArrayStringhe = (chiave, azione, indice, valore) => {
  SettaBlocchi((nds) => nds.map((n) => {
    if (n.id === nodoSelezionatoId) {
      const arrayAttuale = Array.isArray(n.data[chiave]) ? [...n.data[chiave]] : [""];
      if (azione === "MODIFICA") arrayAttuale[indice] = valore;
      if (azione === "AGGIUNGI") arrayAttuale.push("");
      if (azione === "RIMUOVI") arrayAttuale.splice(indice, 1);
      return { ...n, data: { ...n.data, [chiave]: arrayAttuale } };
    }
    return n;
  }));
};

  /*
  Questa è la funzione che utilizziamo per gestire il nodo aggregate che come sempre trova il nodo tramite l'id, 
  crea l'array se già non c'è e lo va a popolare in base all'azione fatta e in più ogni campo avrà anche l'operazione di aggregazione
  associata, min sum etc. 
  */

const gestisciDizionarioAggregazioni = (chiave, azione, indice, campoModificato, valore) => {
  SettaBlocchi((nds) => nds.map((n) => {
    if (n.id === nodoSelezionatoId) {
      const aggregazioniAttuali = Array.isArray(n.data[chiave]) 
        ? [...n.data[chiave]] 
        : [{ field: "", op: "min" }];
      
      if (azione === "MODIFICA") {
        aggregazioniAttuali[indice] = { ...aggregazioniAttuali[indice], [campoModificato]: valore };
      }
      if (azione === "AGGIUNGI") aggregazioniAttuali.push({ field: "", op: "min" });
      if (azione === "RIMUOVI") aggregazioniAttuali.splice(indice, 1);

      return { ...n, data: { ...n.data, [chiave]: aggregazioniAttuali } };
    }
    return n;
  }));
};

  return { 
    AggiornaBlocchi, 
    AggiornaCollegamenti, 
    Associa, 
    aggiornaDatoNodo, 
    gestisciArrayStringhe, 
    gestisciDizionarioAggregazioni, 
    InizioTrascinamento, 
    SopraWorkflow,
    AlRilascio
  };
};