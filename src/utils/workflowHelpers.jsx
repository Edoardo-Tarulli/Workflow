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

// Manteniamo una variabile esterna per i contatori o passala come stato
let contatori = { source: 0, filter: 0, sink: 0, map: 0, keyby: 0, window: 0, aggregate: 0 };

export const generaNuovoIdPerTipo = (tipo) => {
  contatori[tipo] = (contatori[tipo] || 0) + 1;
  return `${tipo}_${contatori[tipo]}`;
};