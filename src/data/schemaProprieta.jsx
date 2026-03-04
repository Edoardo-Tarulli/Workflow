
/*In questo file andiamo a definire lo schema delle proprietà di tutti i nodi.
Esse le andiamo poi a richiamare quando le dobbiamo mandare a schermo in base alla selezione del blocco specifico.
Ogni nodo ha delle proprietà specifiche che vengono definite qui*/

export const SCHEMA_PROPRIETA = {
  source: [
    { label: "Type", key: "type", tipo: "fisso", default: "kafka" },
    { label: "Topic", key: "topic", tipo: "testo", placeholder: "Scrivi qui..." },
    { label: "Bootstrap Servers", key: "bootstrap_servers", tipo: "testo", placeholder: "Scrivi qui..." },
    { label: "Timestamp Field", key: "timestamp_field", tipo: "testo", placeholder: "Scrivi qui..."}
  ],
  filter: [
    { label: "Filter Condition", key: "filter_condition", tipo: "testo", placeholder: "Inserisci condizione..." }
  ],
  map: [
    { label: "Applies To Fields", key: "appliesToFields", tipo: "array_stringhe", placeholder: "Scrivi qui..." }
  ],
  keyby: [
    { label: "Applies To Fields", key: "appliesToFields", tipo: "testo", placeholder: "Scrivi qui..." }
  ],
  window: {
    comuni: [
      { label: "Window Type", key: "windowType", tipo: "select", opzioni: ["tumbling", "hopping", "count"], placeholder: "Seleziona tipo..." }
    ],
    specifici: {
      tumbling: [
        { label: "Duration", key: "duration", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Size", key: "size", tipo: "numero", placeholder: "Inserisci numero intero..." }
      ],
      hopping: [
        { label: "Duration", key: "duration", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Slide", key: "slide", tipo: "numero", placeholder: "Inserisci numero intero..."}
      ],
      count: [
        { label: "Size", key: "size", tipo: "numero", placeholder: "Inserisci numero intero..." },
        { label: "Slide", key: "slide", tipo: "numero", placeholder: "Inserisci numero intero" }
      ]
    }
  },
  aggregate: [
    { label: "Aggregations", key: "aggregations", tipo: "dizionario_aggregazioni", funzioni: ["min", "max", "avg", "sum"], placeholder: 'Inserisci attributo' }
  ],
  sink: [
    { label: "Type", key: "type", tipo: "fisso", default: "kafka" },
    { label: "Topic", key: "topic", tipo: "testo", placeholder: "Scrivi qui..." },
    { label: "Bootstrap Servers", key: "bootstrap_servers", tipo: "testo", placeholder: "Scrivi qui..." },
  ]
};