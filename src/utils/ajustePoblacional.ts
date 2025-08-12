// 2. Umbrales con tipado explícito
type Linaje =
  | "A H1N1"
  | "A H3N2"
  | "B Victoria"
  | "B Yamagata"
  | "No vacunal";

export default function ajustePoblacional(
  poblacion: number,
  levelOfPublicExposure: number
) {

  // 1. Cálculo simplificado de casos importados
  const casosImportados = poblacion * (poblacion < 100 ? 0.02 : 0.01);

  const umbralesBase: Record<Linaje, Record<number, number>> = {
    "A H1N1": { 24: 0, 25: 5, 41: 7, 42: 12 },
    "A H3N2": { 25: 1, 26: 11, 37: 8, 42: 6 },
    "B Victoria": { 24: 3, 41: 9 },
    "B Yamagata": { 25: 2, 41: 10 },
    "No vacunal": { 7: 4 },
  };

  // 3. Función para generar casos semanales
  function generarCasosSemanales(semanaNum: number) {
    const incremento = 13 * (semanaNum - 1);
    const semana: Record<Linaje, Record<number, number>> = {
      "A H1N1": {},
      "A H3N2": {},
      "B Victoria": {},
      "B Yamagata": {},
      "No vacunal": {},
    };

    (Object.keys(umbralesBase) as Linaje[]).forEach((linaje) => {
      [7, 24, 25, 26, 37, 41, 42].forEach((se) => {
        const umbral = umbralesBase[linaje][se];
        semana[linaje][se] =
          umbral !== undefined && casosImportados > umbral + incremento ? 1 : 0;
      });
    });

    return semana;
  }

  // 4. Generar todas las semanas dinámicamente
  const totalSemanas = 9;
  const todosLosCasos = Array.from({ length: totalSemanas }, (_, i) =>
    generarCasosSemanales(i + 1)
  );

  // 5. Cálculo eficiente del resumen
  const multiplicador = levelOfPublicExposure || 1;
  const casosResumen: Record<Linaje, Record<number, number>> = {
    "A H1N1": {},
    "A H3N2": {},
    "B Victoria": {},
    "B Yamagata": {},
    "No vacunal": {},
  };

  (Object.keys(umbralesBase) as Linaje[]).forEach((linaje) => {
    [7, 24, 25, 26, 37, 41, 42].forEach((se) => {
      casosResumen[linaje][se] =
        todosLosCasos.reduce((sum, semana) => sum + semana[linaje][se], 0) *
        multiplicador;
    });
  });

  return casosResumen;
}
