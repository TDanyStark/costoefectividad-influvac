import { useNavigate } from "react-router-dom";
import { URL_BASE } from "@/variables";

function Resumen() {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen flex flex-col overflow-clip"
      style={{
        backgroundImage: `url('${URL_BASE}/img/bg/banner1.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl md:text-5xl text-white font-bold leading-tight mb-8">
        ANÁLISIS FARMACOECONÓMICO DE LA VACUNACIÓN
        <span className="font-light">CONTRA INFLUENZA</span>
      </h1>
      <button onClick={() => navigate("/")}>Volver a páginas internas</button>
    </main>
  );
}

export default Resumen;

