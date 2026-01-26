import './css/App.css'; // Importiamo il css di App
import Navbar from './components/Navbar.jsx'; // Importiamo la Navbar dal suo file di origine
import Home from './components/Home.jsx'; // Importiamo il componente Home dal suo file di orgine


function App () {

  return (
    
    // Contenitore principale che copre l'intera pagina 
    <div
     className='Contenitore'
     
     >

      <Navbar></Navbar> 
      <Home></Home>

    </div>
   
  )
}

export default App; 