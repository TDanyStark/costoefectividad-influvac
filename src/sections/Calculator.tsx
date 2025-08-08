import { URL_BASE } from "@/variables";
import { useState } from "react";
import { Routes, Route, useNavigate, HashRouter } from "react-router-dom";

function PaginasSinRuta() {
  const [vista, setVista] = useState(1);
  const navigate = useNavigate();

  const cambiarVista = (num: number) => setVista(num);

  return (
    <div>
      {vista === 1 && <h2>Página 1</h2>}
      {vista === 2 && <h2>Página 2</h2>}
      {vista === 3 && <h2>Página 3</h2>}
      {vista === 4 && <h2>Página 4</h2>}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => cambiarVista(1)}>Ir a Página 1</button>
        <button onClick={() => cambiarVista(2)}>Ir a Página 2</button>
        <button onClick={() => cambiarVista(3)}>Ir a Página 3</button>
        <button onClick={() => cambiarVista(4)}>Ir a Página 4</button>
        <button onClick={() => navigate("resumen")}>Ir a Resumen</button>
      </div>
    </div>
  );
}

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

const Calculator = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PaginasSinRuta />} />
        <Route path="/resumen" element={<Resumen />} />
      </Routes>
    </HashRouter>
  );
};

export default Calculator;
