// Servicio para cálculos de influenza

import type { FormVariables, VaccinationObject, InfluenzaResults } from '../types/FormTypes';
import { FormValidator } from '../validators/FormValidator';

import ajustePoblacional from "@/utils/ajustePoblacional";
import generateinfluenzaAH1N1 from "@/utils/generateinfluenzaAH1N1";
import generateinfluenzaAH1N1_V from "@/utils/generateInfluenzaAH1N1_V";
import generateinfluenzaAH3N2 from "@/utils/generateinfluenzaAH3N2";
import generateinfluenzaAH3N2_V from "@/utils/generateinfluenzaAH3N2_V";
import generateInfluenzaBVictoria from "@/utils/generateInfluenzaBVictoria";
import generateInfluenzaBVictoria_V from "@/utils/generateInfluenzaBVictoria_V";
import generateInfluenzaBYamagata from "@/utils/generateInfluenzaBYamagata";
import generateInfluenzaBYamagata_V from "@/utils/generateInfluenzaBYamagata_V";
import generateNoVacunal from "@/utils/generateNoVacunal";
import sumarCampoPorDia from "@/utils/sumarCampoPorDia";

export class InfluenzaCalculationService {

  /**
   * Verifica si un año es bisiesto
   */
  private static isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  /**
   * Calcula el número de días en un año
   */
  private static getDaysInYear(year: number): number {
    return this.isLeapYear(year) ? 366 : 365;
  }

  /**
   * Crea el objeto de vacunación validado
   */
  private static createVaccinationObject(formVariables: FormVariables): VaccinationObject {
    const firstVaccinationDate = formVariables.fecha1Vacunacion;
    const firstvaccinatedIndividuals = formVariables.numeroDeVacunados1;
    const secondVaccinationDate = formVariables.fecha2Vacunacion;
    const secondvaccinatedIndividuals = formVariables.numeroDeVacunados2;

    // Validar fechas
    const dateValidation = FormValidator.validateVaccinationDates(
      firstVaccinationDate,
      secondVaccinationDate
    );

    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error || "Error en las fechas de vacunación");
    }

    const firstDate = new Date(firstVaccinationDate);
    let secondDate: Date | null = null;

    if (secondVaccinationDate) {
      secondDate = new Date(secondVaccinationDate);
    }

    return {
      firstVaccinationDate: firstDate,
      firstvaccinatedIndividuals,
      secondVaccinationDate: secondDate,
      secondvaccinatedIndividuals,
    };
  }

  /**
   * Suma casos nuevos de una serie
   */
  private static sumCasosNuevos(serie: Array<{ [k: string]: any; "Casos Nuevos": number }>): number {
    return serie.reduce((acc, item) => acc + (item["Casos Nuevos"] || 0), 0);
  }

  /**
   * Calcula los resultados de influenza
   */
  static calculateInfluenzaResults(formVariables: FormVariables): InfluenzaResults {
    const numEmpleados = formVariables.numEmpleados;
    const nivelExposicion = formVariables.nivelExposicion;
    const diasIncapacidad = formVariables.diasIncapacidad;

    const year = new Date(formVariables.fecha1Vacunacion).getFullYear();
    const diasEnAnio = this.getDaysInYear(year);

    // Crear objeto de vacunación validado
    const vaccinationObject = this.createVaccinationObject(formVariables);

    // Calcular ajuste poblacional
    const ajustePoblacionalResult = ajustePoblacional(numEmpleados, nivelExposicion);

    // Generar datos de influenza sin vacunación
    const influenzaAH1N1 = generateinfluenzaAH1N1(
      numEmpleados,
      ajustePoblacionalResult["A H1N1"]
    );
    const influenzaAH3N2 = generateinfluenzaAH3N2(
      numEmpleados,
      ajustePoblacionalResult["A H3N2"]
    );
    const influenzaBVictoria = generateInfluenzaBVictoria(
      numEmpleados,
      ajustePoblacionalResult["B Victoria"]
    );
    const influenzaBYamagata = generateInfluenzaBYamagata(
      numEmpleados,
      ajustePoblacionalResult["B Yamagata"]
    );
    const noVacunal = generateNoVacunal(
      numEmpleados,
      ajustePoblacionalResult["No vacunal"]
    );

    // Generar datos de influenza con vacunación
    const influenzaAH1N1_V = generateinfluenzaAH1N1_V(
      numEmpleados,
      ajustePoblacionalResult["A H1N1"],
      vaccinationObject
    );
    const influenzaAH3N2_V = generateinfluenzaAH3N2_V(
      numEmpleados,
      ajustePoblacionalResult["A H3N2"],
      vaccinationObject
    );
    const influenzaBVictoria_V = generateInfluenzaBVictoria_V(
      numEmpleados,
      ajustePoblacionalResult["B Victoria"],
      vaccinationObject
    );
    const influenzaBYamagata_V = generateInfluenzaBYamagata_V(
      numEmpleados,
      ajustePoblacionalResult["B Yamagata"],
      vaccinationObject
    );

    // Calcular totales de casos nuevos
    const totalCasosNuevosInfluenzaAH1N1 = this.sumCasosNuevos(influenzaAH1N1);
    const totalCasosNuevosInfluenzaAH1N1_V = this.sumCasosNuevos(influenzaAH1N1_V);
    const totalCasosNuevosInfluenzaAH3N2 = this.sumCasosNuevos(influenzaAH3N2);
    const totalCasosNuevosInfluenzaAH3N2_V = this.sumCasosNuevos(influenzaAH3N2_V);
    const totalCasosNuevosInfluenzaBVictoria = this.sumCasosNuevos(influenzaBVictoria);
    const totalCasosNuevosInfluenzaBVictoria_V = this.sumCasosNuevos(influenzaBVictoria_V);
    const totalCasosNuevosInfluenzaBYamagata = this.sumCasosNuevos(influenzaBYamagata);
    const totalCasosNuevosInfluenzaBYamagata_V = this.sumCasosNuevos(influenzaBYamagata_V);
    const totalCasosNuevosNoVacunal = this.sumCasosNuevos(noVacunal);

    // Totales agrupados por condición de vacunación
    const totalCasosNuevosVacunados =
      totalCasosNuevosInfluenzaAH1N1_V +
      totalCasosNuevosInfluenzaAH3N2_V +
      totalCasosNuevosInfluenzaBVictoria_V +
      totalCasosNuevosInfluenzaBYamagata_V +
      totalCasosNuevosNoVacunal;

    const totalCasosNuevosNoVacunados =
      totalCasosNuevosInfluenzaAH1N1 +
      totalCasosNuevosInfluenzaAH3N2 +
      totalCasosNuevosInfluenzaBVictoria +
      totalCasosNuevosInfluenzaBYamagata +
      totalCasosNuevosNoVacunal;

    // Calcular métricas de salud
    const symptomaticVacunados = totalCasosNuevosVacunados * 0.84;
    const symptomaticNoVacunados = totalCasosNuevosNoVacunados * 0.84;

    const sickDaysVacunados = symptomaticVacunados * 0.4865 * diasIncapacidad;
    const sickDaysNoVacunados = symptomaticNoVacunados * 0.4865 * diasIncapacidad;

    const hospitalizationVacunados = symptomaticVacunados * 0.0154;
    const hospitalizationNoVacunados = symptomaticNoVacunados * 0.0154;

    const mortalityVacunados = symptomaticVacunados * 0.00127;
    const mortalityNoVacunados = symptomaticNoVacunados * 0.00127;

    // Datos para gráficas
    const seriesNoVacunados = [
      influenzaAH1N1,
      influenzaAH3N2,
      influenzaBVictoria,
      influenzaBYamagata,
      noVacunal,
    ];

    const seriesVacunados = [
      influenzaAH1N1_V,
      influenzaAH3N2_V,
      influenzaBVictoria_V,
      influenzaBYamagata_V,
      noVacunal
    ];

    // Calcular infectivos totales por día
    const infectivosTotalesNoVacunados = sumarCampoPorDia(
      seriesNoVacunados,
      "Infectivos",
      diasEnAnio
    );

    const infectivosTotalesVacunados = sumarCampoPorDia(
      seriesVacunados,
      "Infectivos",
      diasEnAnio
    );

    // Arrays individuales por tipo de influenza
    const infectivosAH1N1NoVacunados = influenzaAH1N1.map(item => Math.round(item.Infectivos));
    const infectivosAH3N2NoVacunados = influenzaAH3N2.map(item => Math.round(item.Infectivos));
    const infectivosBVictoriaNoVacunados = influenzaBVictoria.map(item => Math.round(item.Infectivos));
    const infectivosBYamagataNoVacunados = influenzaBYamagata.map(item => Math.round(item.Infectivos));

    const infectivosAH1N1Vacunados = influenzaAH1N1_V.map(item => Math.round(item.Infectivos));
    const infectivosAH3N2Vacunados = influenzaAH3N2_V.map(item => Math.round(item.Infectivos));
    const infectivosBVictoriaVacunados = influenzaBVictoria_V.map(item => Math.round(item.Infectivos));
    const infectivosBYamagataVacunados = influenzaBYamagata_V.map(item => Math.round(item.Infectivos));

    const infectivosNoVacunal = noVacunal.map(item => Math.round(item.Infectivos));

    return {
      totalCasosNuevosVacunados,
      totalCasosNuevosNoVacunados,
      symptomaticVacunados,
      symptomaticNoVacunados,
      sickDaysVacunados,
      sickDaysNoVacunados,
      hospitalizationVacunados,
      hospitalizationNoVacunados,
      mortalityVacunados,
      mortalityNoVacunados,
      diasIncapacidad,
      diasEnAnio,
      infectivosTotalesNoVacunados,
      infectivosAH1N1NoVacunados,
      infectivosAH3N2NoVacunados,
      infectivosBVictoriaNoVacunados,
      infectivosBYamagataNoVacunados,
      infectivosTotalesVacunados,
      infectivosAH1N1Vacunados,
      infectivosAH3N2Vacunados,
      infectivosBVictoriaVacunados,
      infectivosBYamagataVacunados,
      infectivosNoVacunal,
    };
  }

  /**
   * Calcula el indicador de productividad
   */
  static calculateProductivity(
    calculoProductividad: string,
    ventaNeta: number,
    numEmpleados: number
  ): number {
    if (calculoProductividad === "productividad_individual") {
      return ventaNeta;
    } else {
      return numEmpleados > 0 ? ventaNeta / numEmpleados / 12 : 0;
    }
  }
}
