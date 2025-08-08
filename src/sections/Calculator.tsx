import Resumen from "@/pagesreact/Resumen";
import System from "@/pagesreact/System";
import { Routes, Route, HashRouter } from "react-router-dom";

const Calculator = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<System />} />
        <Route path="/resumen" element={<Resumen />} />
      </Routes>
    </HashRouter>
  );
};

export default Calculator;
