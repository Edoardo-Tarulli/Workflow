
/* Questi sono tutti gli input necessari per il funzionamento della pagina */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Workflow from './Workflow.jsx';
import './css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; //Questo è il provider, nativo di React, che serve per la gestione delle routes
import { WorkflowProvider } from './WorkflowContext.jsx'; 

const router = createBrowserRouter ([
  {
    path: "/", //Pagina home
    element: <App />,
  },
  {
    path: "/Workflow", //Pagina Workflow
    element: <Workflow />
  },
]);

/* Questo è il Dom di React, che crea la radice delle rotte e il tutto è avvolto nel Workflow provider che è necessario affinchè le modifiche
che vengono fatte nella schermata workflow durante la sua creazione, quindi trascinamento blocchi etc vengano mantenute inalterate quando si passa dal workflow
ad una delle altre schermate e poi si ritorna in workflow. 
 */


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* IL PROVIDER Avvolge tutto il sistema di rotte */}
    <WorkflowProvider>
      <RouterProvider router={router} />
    </WorkflowProvider>
  </React.StrictMode>,
);