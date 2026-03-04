import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { useCallback } from 'react';

export const useWorkflowActions = (SettaBlocchi, SettaCollegamenti, nodoSelezionatoId) => {
  
  // --- FUNZIONI STANDARD REACT FLOW ---
  const AggiornaBlocchi = useCallback(
    (changes) => SettaBlocchi((nds) => applyNodeChanges(changes, nds)),
    [SettaBlocchi]
  );

  const AggiornaCollegamenti = useCallback(
    (changes) => SettaCollegamenti((eds) => applyEdgeChanges(changes, eds)),
    [SettaCollegamenti]
  );

  const Associa = useCallback(
    (params) => SettaCollegamenti((eds) => addEdge(params, eds)),
    [SettaCollegamenti]
  );

const aggiornaDatoNodo = (chiave, valore) => {
    SettaBlocchi((nds) => nds.map((n) => 
      n.id === nodoSelezionatoId ? { ...n, data: { ...n.data, [chiave]: valore } } : n
    ));
  };

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
    gestisciDizionarioAggregazioni 
  };
};