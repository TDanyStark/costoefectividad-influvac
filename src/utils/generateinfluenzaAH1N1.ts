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
  "α (mortalidad)": number;
  "γ (recuperación)": number;
  "ε (infectividad)": number;
  "1/ε (latencia)": number;
  "λ (Transmisibilidad)": number;
  Ro: number;
};

export default function generateinfluenzaAH1N1(
  suceptiblesIniciales: number,
  ajustePoblacional: Record<number, number>
) {
  const year = new Date().getFullYear();
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const diasEnAnio = isLeap(year) ? 366 : 365;

  const serie: Array<TypeSerie> = [];

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
    "α (mortalidad)": 0,
    "γ (recuperación)": 0.33,
    "ε (infectividad)": 0.5,
    "1/ε (latencia)": 2,
    "λ (Transmisibilidad)": 0.28,
    Ro: 0.85,
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

    const round2 = (num: number) => Math.round(num * 100) / 100;

    const Suceptibles =
      prev.Suceptibles -
      (prev["λ (Transmisibilidad)"] *
        prev.Infectivos *
        (prev.Suceptibles / prev.N)) -
      prev.F;

    const Expuestos =
      prev.Expuestos +
      (prev["λ (Transmisibilidad)"] * prev.Infectivos * prev.Suceptibles /
        prev.N) -
      (prev.Expuestos * prev["ε (infectividad)"]);

    const Infectivos =
      prev.Infectivos +
      Fcol +
      (prev.Expuestos * prev["ε (infectividad)"]) -
      (prev.Infectivos * prev["γ (recuperación)"]) -
      (prev.Infectivos * prev["α (mortalidad)"]);

    const Recuperados =
      prev.Recuperados + (prev.Infectivos * prev["γ (recuperación)"]);

    const Mortalidad = prev.Infectivos * prev["α (mortalidad)"];

    const N = Suceptibles + Expuestos + Infectivos + Recuperados;

    const porcentaje = N !== 0 ? Recuperados / N : 0;

    const Casos = prev.Casos + Expuestos;
    const Acumulado = Math.floor(Casos);
    const CasosNuevos = Acumulado - prev.Acumulado;

    const alpha = 0;
    const gamma = 1/3;
    const invEpsilon = 2;
    const epsilon = 1/invEpsilon;
    const Ro = 0.85;
    const lambda = 1/3 * Ro;

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
      "α (mortalidad)": alpha,
      "γ (recuperación)": gamma,
      "ε (infectividad)": epsilon,
      "1/ε (latencia)": invEpsilon,
      "λ (Transmisibilidad)": lambda,
      Ro,
    });
  }

  return serie;
}
