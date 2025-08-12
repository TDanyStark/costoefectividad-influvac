// Helper genérico para sumar un campo numérico día a día devolviendo siempre 365 posiciones
const sumarCampoPorDia = (
  series: Array<Array<Record<string, any>>>,
  campo: string,
  dias: number = 365
): number[] => {
  const resultado = new Array(dias).fill(0);
  for (let d = 0; d < dias; d++) {
    for (const serie of series) {
      const val = serie[d]?.[campo];
      if (typeof val === "number" && !isNaN(val)) {
        resultado[d] += val;
      }
    }
    resultado[d] = Math.round(resultado[d]);
  }
  return resultado;
};

export default sumarCampoPorDia;