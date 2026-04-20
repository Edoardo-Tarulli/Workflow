
/*
Questa è la funzione che andiamo poi a richiamare nel codice del workflow per gestire il nodo window che è quello più delicato
in quanto si tratta di un oggetto e non di un array. Pertanto andiamo a specificare che se il tipo del nodo selezionato è window
allora ci ritorna praticamente le specifiche comuni del nodo ovvero il selezionare il tipo di finestra e quelli specifici, in quanto
ogni finestra (hooping, count e l'altro) ha dei parametri specifici

*/
export const getCampiFinali = (nodo, schema) => {
  if (!nodo) return [];
  if (nodo.type === 'window') {
    const tipoScelto = nodo.data.windowType;
    return [
      ...schema.window.comuni,
      ...(schema.window.specifici[tipoScelto] || [])
    ];
  }
  return schema[nodo.type] || [];
};

/*
Funzione che ci permette di gestire l'id dinamico dei blocchi in modo tale che non si vengano 
a creare dei problemi a seguito di import/esport e successivo inserimento di nuovi nodi (indipendentemente dal tipo).
Essa sostituisce la precedente funzione che era statica.
*/
export const calcolaNuovoId = (tipo, blocchi) => {
  const massimoId = blocchi
    .filter((n) => n.type === tipo)
    .reduce((max, n) => {
      const parti = n.id.split('_');
      const numero = parseInt(parti[parti.length - 1]);
      return !isNaN(numero) && numero > max ? numero : max;
    }, 0);
  return `${tipo}_${massimoId + 1}`;
};