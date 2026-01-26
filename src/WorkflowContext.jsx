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