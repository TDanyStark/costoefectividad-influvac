// Constantes de configuración por defecto

import type { FormVariables } from './types/FormTypes';

export const DEFAULT_FORM_VARIABLES: FormVariables = {
  numEmpleados: 5000,
  fecha1Vacunacion: "2025-05-30",
  numeroDeVacunados1: 2000,
  fecha2Vacunacion: "",
  numeroDeVacunados2: 0,
  calculoProductividad: "promedio_empresarial",
  ventaNeta: 4388774488000,
  indicadorProductividad: 73146241.47,
  salarioPromedio: 6000000,
  precioVacunacion: 55000,
  nivelExposicion: 2,
  diasIncapacidad: 5,
};

export const FORM_FIELDS = [
  "numEmpleados",
  "fecha1Vacunacion",
  "numeroDeVacunados1",
  "fecha2Vacunacion",
  "numeroDeVacunados2",
  "calculoProductividad",
  "ventaNeta",
  "salarioPromedio",
  "precioVacunacion",
  "nivelExposicion",
  "diasIncapacidad",
] as const;

export const NUMERIC_FIELDS = [
  "numEmpleados",
  "numeroDeVacunados1",
  "numeroDeVacunados2",
  "ventaNeta",
  "salarioPromedio",
  "precioVacunacion",
  "diasIncapacidad",
] as const;

export const TEXT_FIELDS = [
  "fecha1Vacunacion",
  "fecha2Vacunacion",
  "calculoProductividad",
  "nivelExposicion",
] as const;

export const VIEW_BACKGROUND_MAP: { [key: string]: string } = {
  view2: "banner3",
  view3: "banner4",
  view4: "banner5",
};

export const STORAGE_KEYS = {
  FORM_DATA: "influvac-form-data",
  RESUMEN_DATA: "influvac-resumen-data",
} as const;
