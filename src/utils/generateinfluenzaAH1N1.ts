type TypeSerie = {
  Fecha: string;
  Día: number;
  Suceptibles: number;
  Expuestos: number;
  Infectivos: number;
  Recuperados: number;
  Mortalidad: number;
  N: number;
  "%": number;
  F: number;
  Casos: number;
  Acumulado: number;
  "Casos Nuevos": number;
};

export default function generateinfluenzaAH1N1(
  suceptiblesIniciales: number,
  ajustePoblacional: Record<number, number>
) {
  const year = new Date().getFullYear();
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const diasEnAnio = isLeap(year) ? 366 : 365;

  const serie: Array<TypeSerie> = [];

  // --- Constantes del modelo ---
  const alpha = 0;
  const gamma = 1 / 3;
  const invEpsilon = 2;
  const epsilon = 1 / invEpsilon;
  const Ro = 0.85;
  const lambda = (1 / 3) * Ro;

  // --- Fila inicial ---
  serie.push({
    Fecha: new Date(year, 0, 1).toISOString().split("T")[0],
    Día: 1,
    Suceptibles: suceptiblesIniciales,
    Expuestos: 0,
    Infectivos: 0,
    Recuperados: 0,
    Mortalidad: 0,
    N: suceptiblesIniciales,
    "%": 0,
    F: 0,
    Casos: 0,
    Acumulado: 0,
    "Casos Nuevos": 0,
    // Ya no se agregan los parámetros constantes
  });

  // --- Filas siguientes ---
  for (let i = 1; i < diasEnAnio; i++) {
    const prev = serie[i - 1];
    const dia = i + 1;
    const fechaActual = new Date(year, 0, dia);

    // Calcular semana normal: cada 7 días empieza una nueva semana
    const semanaActual = dia % 7 === 0 ? dia / 7 : null;

    // Si la semana está en el ajustePoblacional, usar el valor, sino 0
    const Fcol = semanaActual !== null ? (ajustePoblacional[semanaActual] ?? 0) : 0;

    const Suceptibles =
      prev.Suceptibles -
      (lambda * prev.Infectivos * (prev.Suceptibles / prev.N)) -
      prev.F;

    const Expuestos =
      prev.Expuestos +
      (lambda * prev.Infectivos * prev.Suceptibles / prev.N) -
      (prev.Expuestos * epsilon);

    const Infectivos =
      prev.Infectivos +
      Fcol +
      (prev.Expuestos * epsilon) -
      (prev.Infectivos * gamma) -
      (prev.Infectivos * alpha);

    const Recuperados =
      prev.Recuperados + (prev.Infectivos * gamma);

    const Mortalidad = prev.Infectivos * alpha;

    const N = Suceptibles + Expuestos + Infectivos + Recuperados;

    const porcentaje = N !== 0 ? Recuperados / N : 0;

    const Casos = prev.Casos + Expuestos;
    const Acumulado = Math.floor(Casos);
    const CasosNuevos = Acumulado - prev.Acumulado;

    serie.push({
      Fecha: fechaActual.toISOString().split("T")[0],
      Día: i + 1,
      Suceptibles,
      Expuestos,
      Infectivos,
      Recuperados,
      Mortalidad,
      N,
      "%": porcentaje,
      F: Fcol,
      Casos,
      Acumulado,
      "Casos Nuevos": CasosNuevos,
      // Ya no se agregan los parámetros constantes
    });
  }

  return serie;
}
