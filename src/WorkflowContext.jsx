/*
Questo è un file di supporto al workflow dove andiamo a gestire lo stato di tutti i suoi componenti interni. Serve per evitare che
quando si passa da una schermata all'altra il workflow si "resetti" cioè ritorni vuoto, da capo. Questo perché prima lo stato era definito
direttamente all'interno della pagina workflow e ogni volta che il browser visualizza la schermata workflow distrugge e ricrea il contenuto
quindi se lo stato si trova al suo interno, si resetta. In questo modo, spostato lo stato altrove evitiamo che ciò accada
*/ 




import { createContext, useContext, useState } from 'react';

const WorkflowContext = createContext();

export const WorkflowProvider = ({ children }) => {
  const [blocchi, SettaBlocchi] = useState([]);
  const [collegamenti, SettaCollegamenti] = useState([]);
  const [SidebarAperta, SettaAperturaSidebar] = useState(false);
  const [GestioneAperta, SettaGestioneAperta] = useState(false);
  const [ModalitaDark, SettaModalitaDark] = useState(false);

  return (
    <WorkflowContext.Provider value={{
      blocchi, SettaBlocchi,
      collegamenti, SettaCollegamenti,
      SidebarAperta, SettaAperturaSidebar,
      GestioneAperta, SettaGestioneAperta,
      ModalitaDark, SettaModalitaDark
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(WorkflowContext);