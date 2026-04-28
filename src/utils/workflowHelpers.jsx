import { useCallback, useState, useMemo } from 'react';

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

/*
Questa è la funzione che ci permette di gestire i collegamenti "validi", vale a dire che due nodi diversi possono essere mandati 
allo stesso nodo solo se quest'ultimo è un union, altrimenti per due nodi abbiamo bisogno ad esempio di due aggregate, due filter etc.
Inoltre utilizziamo quello che viene chiamato react-hot-toast per una visualizzazione a schermo di un messaggio errore in caso
l'utente provi a collegare un nodo ad un nodo successivo, al quale è già collegato un altro nodo (a meno che non sia union!)
*/

export const connessioneValida = (connection, blocchi, collegamenti, SettaMessaggioErrore) => {
    const targetNode = blocchi.find((n) => n.id === connection.target);
    
    if (targetNode && targetNode.type !== 'union') {
      const collegamentiInIngresso = collegamenti.filter(
        (edge) => edge.target === connection.target
      );
      
      if (collegamentiInIngresso.length >= 1) {
        // TRIGGER MESSAGGIO
        SettaMessaggioErrore("Solo il nodo Union può ricevere più stream in ingresso!");
        
        // Autoreset del messaggio dopo 3 secondi
        setTimeout(() => SettaMessaggioErrore(null), 3000);
        
        return false; 
      }
    }
    return true;
};


/*
La funzione che segue ci permette di andare a verificare se il nodo selezionato è union e in caso
troviamo i nodi che sono connessi ad esso. Cosìcche i nodi che sono connessi all'union li andiamo ad inserire nelle 
sue proprietà.
*/

export const calcolaErroriValidazione = (blocchi, collegamenti) => {
  const lista = [];

  // 1. Regola: Almeno un Source
  if (!blocchi.some(n => n.type === 'source')) {
    lista.push({ tipo: 'globale', msg: "Manca un nodo Source" });
  }

  // 2. Regola: Almeno un Sink
  if (!blocchi.some(n => n.type === 'sink')) {
    lista.push({ tipo: 'globale', msg: "Manca un nodo Sink" });
  }

  // 3. Regola: Union con almeno 2 ingressi
  blocchi.filter(n => n.type === 'union').forEach(u => {
    const numIn = collegamenti.filter(e => e.target === u.id).length;
    if (numIn < 2) {
      lista.push({ tipo: 'nodo', id: u.id, msg: `Il nodo ${u.id} richiede almeno 2 ingressi` });
    }
  });

  // 4. Regola: Nodi non isolati, cioè significa che ogni nodo deve essere collegato ad un altro. 
  blocchi.forEach(nodo => {
    const haCollegamentiInEntrata = collegamenti.some(e => e.target === nodo.id);
    const haCollegamentiInUscita = collegamenti.some(e => e.source === nodo.id);

    // Un nodo è isolato se non ha né entrate né uscite
    if (!haCollegamentiInEntrata && !haCollegamentiInUscita) {
      lista.push({ 
        tipo: 'nodo', 
        id: nodo.id, 
        msg: `Il nodo ${nodo.id} è isolato e deve essere collegato` 
      });
    } 
    // 5. Regola: Ovviamente il nodo Source e Sink devono avere rispettivamente un collegamento in uscita e uno in ingresso, dato che
    // rappresentano i nodi di inizio e fine. 
    else {
      if (nodo.type === 'source' && !haCollegamentiInUscita) {
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo Source (${nodo.id}) non ha collegamenti in uscita` });
      }
      if (nodo.type === 'sink' && !haCollegamentiInEntrata) {
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo Sink (${nodo.id}) non ha collegamenti in ingresso` });
      }
      if (nodo.type !== 'source' && nodo.type !== 'sink' && (!haCollegamentiInEntrata || !haCollegamentiInUscita)) {
        // Se è un nodo intermedio ma gli manca un pezzo della catena
        const manca = !haCollegamentiInEntrata ? "ingresso" : "uscita";
        lista.push({ tipo: 'nodo', id: nodo.id, msg: `Il nodo ${nodo.id} è incompleto: manca un collegamento in ${manca}` });
      }
    }
  });

  return lista;
};


/*
Questa è la funzione che ci consente di andare a trasformare i dati grafici di React Flow, 
quindi nodi e collegamenti, in formato JSON. Viene gestito il fatto che se il workflow non è corretto, viene data la possibilità di esportare
solo la bozza, la quale può contenere anche errori e nel JSON di essa ci saranno anche le posizioni in modo tale che la possiamo importare
nuovamente per continuare a lavorarci. Se invece il workflow non presenta errori allora lo possiamo esportare e rappresenta il workflow
corretto che poi verrà usato su flink quindi contiene solo dati puliti, senza posizioni o altro. 
*/

export const gestisciEsportazione = (isDraft, blocchi, collegamenti, erroriValidazione, SettaMessaggioErrore) => {
  if (!isDraft && erroriValidazione.length > 0) {
    SettaMessaggioErrore("Impossibile esportare: risolvi prima tutti i problemi nel workflow.");
    setTimeout(() => SettaMessaggioErrore(null), 4000);
    return;
  }

  try {
    const steps = blocchi.map((nodo) => {
      const collegamentiInUscita = collegamenti
        .filter((edge) => edge.source === nodo.id)
        .map((edge) => edge.target);

      const { label, ...datiPuliti } = nodo.data || {};

      // Se non è una bozza, creiamo un oggetto senza la proprietà 'position'
      let stepDati = {
        id: nodo.id,
        type: nodo.type,
        ...datiPuliti,
      };

      if (isDraft) {
        stepDati.position = nodo.position; // Includiamo la posizione solo nella bozza
      }

      if (nodo.type !== 'sink') {
        stepDati.next = collegamentiInUscita;
      } else if (!stepDati.sinkType) {
        stepDati.sinkType = "print"; 
      }

      return stepDati;
    });

    // Serve per generare la data di esportazione solo nel momento in cui il workflow è una bozza 
    const workflowFinale = isDraft 
      ? { steps, status: 'draft', dataEsportazione: new Date().toISOString() } 
      : { steps };

    const dataStr = JSON.stringify(workflowFinale, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const prefix = isDraft ? 'BOZZA_workflow' : 'workflow_flink';
    link.download = `${prefix}_${new Date().toISOString().slice(0,10)}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Messaggio informativo post-esportazione
    if (!isDraft) {
      alert("Esportazione per Flink completata.\n\nNOTA: Questo file è ottimizzato per la produzione e NON contiene le posizioni dei nodi. Per modifiche grafiche future, usa sempre il file 'BOZZA'.");
    }
  } catch (error) {
    console.error("Errore durante l'esportazione:", error);
  }
};


/*
Funzione per la gestione dell'importazione di un JSON da file. Naturalmente nella ricerca del file ci vengono mostrati solo
i file che hanno estensione JSON. Nel caso in cui l'utente dovesse importare un workflow già completo e corretto, in esso non ci sonno
le posizioni quindi implementiamo una piccola griglia così da dare comunque una posizione ai nodi, da verificare se funziona correttamente
o sufficientemente bene 
*/

export const gestisciImportazione = (event, SettaBlocchi, SettaCollegamenti, SettaMessaggioErrore) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.steps) throw new Error("Formato non valido");

      const nuoviNodi = json.steps.map((step, indice) => {
        // Algoritmo di emergenza: Griglia 3xN se manca la posizione
        const xDefault = (indice % 3) * 300; 
        const yDefault = Math.floor(indice / 3) * 200;

        return {
          id: step.id,
          type: step.type,
          position: step.position || { x: xDefault, y: yDefault },
          data: { 
            label: step.id.toUpperCase(),
            ...Object.keys(step)
              .filter(key => !['id', 'type', 'position', 'next'].includes(key))
              .reduce((obj, key) => ({ ...obj, [key]: step[key] }), {})
          },
        };
      });

      const nuoviEdges = [];
      json.steps.forEach((step) => {
        if (step.next && Array.isArray(step.next)) {
          step.next.forEach((targetId) => {
            nuoviEdges.push({
              id: `e-${step.id}-${targetId}`,
              source: step.id,
              target: targetId,
              animated: false, // Così le linee rimangono continue altrimenti, quando reimportiamo, diventano tratteggiate
              style: { strokeWidth: 2 } 
            });
          });
        }
      });

      SettaBlocchi(nuoviNodi);
      SettaCollegamenti(nuoviEdges);
      event.target.value = ''; // Reset input
    } catch (err) {
      SettaMessaggioErrore("Errore nell'importazione del file JSON.");
      setTimeout(() => SettaMessaggioErrore(null), 3000);
    }
  };
  reader.readAsText(file);
};