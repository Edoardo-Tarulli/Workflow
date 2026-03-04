
/*
Import dell'hook useInView, nativo di react, che serve per "osservare" lo stato del componente e gestirlo di conseguenza.
*/


import { useInView } from 'react-intersection-observer';

{/* Componente rivelatore che va ad integrare le animazioni e i suoi parametri vengono poi restituiti nel return ed esportati */}
const Rivelatore = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // L'animazione avviene solo la prima volta che scorri
    threshold: 0.1,    // Parte quando il 10% dell'elemento è visibile
  });

  return (
    <div ref={ref} className={`rivela-elemento ${inView ? 'visibile' : ''}`}>
      {children}
    </div>
  );
};

export default Rivelatore;