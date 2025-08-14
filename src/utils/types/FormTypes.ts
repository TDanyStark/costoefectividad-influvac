// Tipos para el formulario y sus variables

export interface FormVariables {
  numEmpleados: number;
  fecha1Vacunacion: string;
  numeroDeVacunados1: number;
  fecha2Vacunacion: string;
  numeroDeVacunados2: number;
  calculoProductividad: string;
  ventaNeta: number;
  indicadorProductividad: number;
  salarioPromedio: number;
  precioVacunacion: number;
  nivelExposicion: number;
  diasIncapacidad: number;
}

export interface FormElements {
  [key: string]: HTMLInputElement | HTMLSelectElement | null;
}

export interface VaccinationObject {
  firstVaccinationDate: Date;
  firstvaccinatedIndividuals: number;
  secondVaccinationDate: Date | null;
  secondvaccinatedIndividuals: number;
}

export interface InfluenzaResults {
  totalCasosNuevosVacunados: number;
  totalCasosNuevosNoVacunados: number;
  symptomaticVacunados: number;
  symptomaticNoVacunados: number;
  sickDaysVacunados: number;
  sickDaysNoVacunados: number;
  hospitalizationVacunados: number;
  hospitalizationNoVacunados: number;
  mortalityVacunados: number;
  mortalityNoVacunados: number;
  diasIncapacidad: number;
  diasEnAnio: number;
  infectivosTotalesNoVacunados: number[];
  infectivosAH1N1NoVacunados: number[];
  infectivosAH3N2NoVacunados: number[];
  infectivosBVictoriaNoVacunados: number[];
  infectivosBYamagataNoVacunados: number[];
  infectivosTotalesVacunados: number[];
  infectivosAH1N1Vacunados: number[];
  infectivosAH3N2Vacunados: number[];
  infectivosBVictoriaVacunados: number[];
  infectivosBYamagataVacunados: number[];
  infectivosNoVacunal: number[];
}

export interface ResumenData {
  costoTotalVacunacion: number;
  perdidasOperativasNoVacunados: number;
  perdidasOperativasVacunados: number;
  perdidaProductividadNoVacunados: number;
  perdidaProductividadVacunados: number;
  porcentajeVacunacion: number;
  totalCasosNuevosNoVacunados: number;
  totalCasosNuevosVacunados: number;
  symptomaticNoVacunados: number;
  symptomaticVacunados: number;
  sujetosIncapacitadosNoVacunados: number;
  sujetosIncapacitadosVacunados: number;
  sickDaysNoVacunados: number;
  sickDaysVacunados: number;
  hospitalizationNoVacunados: number;
  hospitalizationVacunados: number;
  mortalityNoVacunados: number;
  mortalityVacunados: number;
  ahorro: number;
  relacionCostoBeneficio: number;
  icer: number;
  timestamp: number;
}
