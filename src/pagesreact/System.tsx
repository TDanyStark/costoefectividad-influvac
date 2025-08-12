import { URL_BASE } from "@/variables";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Grafic from "./Grafic";

function System() {
  const [vista, setVista] = useState(1);
  const navigate = useNavigate();
  const cambiarVista = (num: number) => setVista(num);

  return (
    <main
      className="min-h-screen flex flex-col overflow-clip"
      style={{
        backgroundImage: `url('${URL_BASE}/img/bg/banner2.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <img className="w-52 h-auto" src={`${URL_BASE}/img/logoabbott_white.webp`} alt="Logo de Abbott" />
        </div>
      </header>
      {vista === 1 && <h2>Página 1</h2>}
      {vista === 2 && <h2>Página 2</h2>}
      {vista === 3 && <h2>Página 3</h2>}
      {vista === 4 && <Grafic />}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => cambiarVista(1)}>Ir a Página 1</button>
        <button onClick={() => cambiarVista(2)}>Ir a Página 2</button>
        <button onClick={() => cambiarVista(3)}>Ir a Página 3</button>
        <button onClick={() => cambiarVista(4)}>Ir a Página 4</button>
        <button onClick={() => navigate("resumen")}>Ir a Resumen</button>
      </div>
    </main>
  );
}

export default System;
