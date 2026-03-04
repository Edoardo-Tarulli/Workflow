
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

// E' una variabile che specifica i contatori per l'id di ogni nodo. Questo per incrementare l'id di ogni nodo specifico
// quando ne vengono immessi più dello stesso tipo nel workflow. La funzione generaNuovoIdPerTipo va a generare l'id
// di ogni nodo, in particolare il primo e poi lo incrementa in base al tipo
let contatori = { source: 0, filter: 0, sink: 0, map: 0, keyby: 0, window: 0, aggregate: 0 };

export const generaNuovoIdPerTipo = (tipo) => {
  contatori[tipo] = (contatori[tipo] || 0) + 1;
  return `${tipo}_${contatori[tipo]}`;
};