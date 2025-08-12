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

export default function generateInfluenzaBYamagata_V(
  suceptiblesIniciales: number,
  ajustePoblacional: Record<number, number>,
  vaccinationObject: {
    firstVaccinationDate: Date;
    firstvaccinatedIndividuals: number;
    secondVaccinationDate: Date | null;
    secondvaccinatedIndividuals: number;
  }
) {
  const year = new Date().getFullYear();
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const diasEnAnio = isLeap(year) ? 366 : 365;
  const vaccinationProtection = 0.534;

  const dayOfYear = (date: Date | null) =>
    date
      ? Math.floor(
          (date.getTime() - new Date(year, 0, 0).getTime()) / 86400000
        ) + 1
      : null;

  const firstVaccinationDayOfYear = dayOfYear(
    vaccinationObject.firstVaccinationDate
  );
  const secondVaccinationDayOfYear = dayOfYear(
    vaccinationObject.secondVaccinationDate
  );

  const porcentajeFirstDay = vaccinationObject.firstVaccinationDate
    ? vaccinationObject.firstvaccinatedIndividuals / suceptiblesIniciales
    : 0;

  const porcentajeSecondDay = vaccinationObject.secondVaccinationDate
    ? (vaccinationObject.secondvaccinatedIndividuals +
        vaccinationObject.firstvaccinatedIndividuals) /
      suceptiblesIniciales
    : 0;


  const getPorcentajeVacunacion = (day: number) => {
    if (secondVaccinationDayOfYear && day > secondVaccinationDayOfYear)
      return porcentajeSecondDay;
    if (firstVaccinationDayOfYear && day > firstVaccinationDayOfYear)
      return porcentajeFirstDay;
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
    "λ (Transmisibilidad)":
      Ro * gamma - Ro * gamma * getPorcentajeVacunacion(1) * vaccinationProtection,
  });

  for (let i = 1; i < diasEnAnio; i++) {
    const prev = serie[i - 1];
    const dia = i + 1;
    const fechaActual = new Date(year, 0, dia);
    const semanaActual = dia % 7 === 0 ? dia / 7 : null;
    const Fcol = semanaActual ? ajustePoblacional[semanaActual] ?? 0 : 0;
    const lambda =
      Ro * gamma - Ro * gamma * getPorcentajeVacunacion(dia) * vaccinationProtection;

    const susceptiblesFactor =
      prev["λ (Transmisibilidad)"] * prev.Infectivos * (prev.Suceptibles / prev.N);
    const Suceptibles = prev.Suceptibles - susceptiblesFactor - prev.F;
    const Expuestos = prev.Expuestos + susceptiblesFactor - prev.Expuestos * epsilon;
    const Infectivos =
      prev.Infectivos + Fcol + prev.Expuestos * epsilon - prev.Infectivos * gamma;
    const Recuperados = prev.Recuperados + prev.Infectivos * gamma;
    const Mortalidad = prev.Infectivos * alpha;
    const N = Suceptibles + Expuestos + Infectivos + Recuperados;
    const porcentaje = N ? Recuperados / N : 0;
    const Casos = prev.Casos + Expuestos;
    const Acumulado = Math.floor(Casos);
    const CasosNuevos = Acumulado - prev.Acumulado;

    serie.push({
      Fecha: fechaActual.toISOString().split("T")[0],
      Día: dia,
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
