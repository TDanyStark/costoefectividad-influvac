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
  "λ (Transmisibilidad)": number;
};

export default function generateinfluenzaAH1N1_V(
  suceptiblesIniciales: number,
  ajustePoblacional: Record<number, number>,
  vaccinationObject: {
    firstVaccinationDate: string;
    firstvaccinatedIndividuals: number;
    secondVaccinationDate: string;
    secondvaccinatedIndividuals: number;
  }
) {
  const year = new Date().getFullYear();
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const diasEnAnio = isLeap(year) ? 366 : 365;

  // validar si tiene vacunación 1 y si tiene convertirlo a fecha
  const firstVaccinationDate = vaccinationObject.firstVaccinationDate
    ? new Date(vaccinationObject.firstVaccinationDate)
    : null;

  const secondVaccinationDate = vaccinationObject.secondVaccinationDate
    ? new Date(vaccinationObject.secondVaccinationDate)
    : null;

    // si hay 2 fechas verificar que la segunda no sea menor
    if (firstVaccinationDate && secondVaccinationDate && secondVaccinationDate < firstVaccinationDate) {
      throw new Error("La segunda fecha de vacunación no puede ser menor que la primera.");
    }

  // calcular el dia del año de cada fecha
  const firstVaccinationDayOfYear = firstVaccinationDate
    ? Math.floor(
        (firstVaccinationDate.getTime() - new Date(year, 0, 0).getTime()) /
          1000 /
          60 /
          60 /
          24
      ) + 1
    : null;

  const secondVaccinationDayOfYear = secondVaccinationDate
    ? Math.floor(
        (secondVaccinationDate.getTime() - new Date(year, 0, 0).getTime()) /
          1000 /
          60 /
          60 /
          24
      ) + 1
    : null;

    const porcentajeFirstDay = firstVaccinationDayOfYear
      ? (vaccinationObject.firstvaccinatedIndividuals / suceptiblesIniciales)
      : 0;

    const porcentajeSecondDay = secondVaccinationDayOfYear
      ? (vaccinationObject.secondvaccinatedIndividuals / suceptiblesIniciales)
      : 0;


    const vaccinationProtection = 0.949;

  const calculatePorcentByDay = (day: number) => {
    // segun el dia dar porcentaje, entonces tener en cuenta porcentajeFirstDay y porcentajeSecondDay cuando sea mayor al dia debe empezar a contar ese porcentaje
    if (firstVaccinationDayOfYear && day > firstVaccinationDayOfYear) {
      return porcentajeFirstDay;
    }
    if (secondVaccinationDayOfYear && day > secondVaccinationDayOfYear) {
      return porcentajeSecondDay;
    }
    return 0;
  };

  const serie: Array<TypeSerie> = [];

  const alpha = 0;
  const gamma = 1 / 3;
  const invEpsilon = 2;
  const epsilon = 1 / invEpsilon;
  const Ro = 0.85;

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
    // Solo λ (Transmisibilidad) y Ro se mantienen, el resto se usan como constantes
    "λ (Transmisibilidad)": (Ro * gamma) - ((Ro * gamma) * calculatePorcentByDay(1) * vaccinationProtection),
  });

  // --- Filas siguientes ---
  for (let i = 1; i < diasEnAnio; i++) {
    const prev = serie[i - 1];
    const dia = i + 1;
    const fechaActual = new Date(year, 0, dia);

    // Calcular semana normal: cada 7 días empieza una nueva semana
    const semanaActual = dia % 7 === 0 ? dia / 7 : null;

    // Si la semana está en el ajustePoblacional, usar el valor, sino 0
    const Fcol =
      semanaActual !== null ? ajustePoblacional[semanaActual] ?? 0 : 0;

    const lambda = (Ro * gamma) - ((Ro * gamma) * calculatePorcentByDay(dia) * vaccinationProtection);

    const Suceptibles =
      prev.Suceptibles -
      prev["λ (Transmisibilidad)"] *
        prev.Infectivos *
        (prev.Suceptibles / prev.N) -
      prev.F;

    const Expuestos =
      prev.Expuestos +
      (prev["λ (Transmisibilidad)"] * prev.Infectivos * prev.Suceptibles) /
        prev.N -
      prev.Expuestos * epsilon;

    const Infectivos =
      prev.Infectivos +
      Fcol +
      prev.Expuestos * epsilon -
      prev.Infectivos * gamma -
      prev.Infectivos * alpha;

    const Recuperados =
      prev.Recuperados + prev.Infectivos * gamma;

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
      "λ (Transmisibilidad)": lambda,
    });
  }

  return serie;
}
