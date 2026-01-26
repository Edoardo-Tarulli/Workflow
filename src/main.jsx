import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Workflow from './Workflow.jsx';
import './css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// Importa il provider che hai creato
import { WorkflowProvider } from './WorkflowContext.jsx'; 

const router = createBrowserRouter ([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/Workflow",
    element: <Workflow />
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* IL PROVIDER Avvolge tutto il sistema di rotte */}
    <WorkflowProvider>
      <RouterProvider router={router} />
    </WorkflowProvider>
  </React.StrictMode>,
);