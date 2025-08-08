import { useState } from "react";
import { useNavigate } from "react-router-dom";

function System() {
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

export default System;