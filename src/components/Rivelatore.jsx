import { useInView } from 'react-intersection-observer';

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