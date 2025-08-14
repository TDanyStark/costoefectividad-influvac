// Servicio para actualización del DOM

import type {
  FormVariables,
  InfluenzaResults,
  ResumenData,
} from "../types/FormTypes";
import { DataFormatter } from "../formatters/DataFormatter";
import { StorageService } from "./StorageService";

export class DOMUpdateService {
  /**
   * Actualiza todos los resultados en el DOM
   */
  static updateAllResults(
    formVariables: FormVariables,
    calculatedResults: InfluenzaResults
  ): void {
    const totalVacunados =
      formVariables.numeroDeVacunados1 + formVariables.numeroDeVacunados2;
    const porcentajeVacunacion =
      (totalVacunados / formVariables.numEmpleados) * 100;
    const costoTotalVacunacion = Math.round(
      totalVacunados * formVariables.precioVacunacion
    );

    console.log("Cálculos realizados:", {
      totalVacunados: totalVacunados.toLocaleString("es-CO"),
      porcentajeVacunacion: porcentajeVacunacion.toFixed(2) + "%",
      costoTotalVacunacion: "$" + costoTotalVacunacion.toLocaleString("es-CO"),
      sickDaysVacunados: calculatedResults.sickDaysVacunados,
      sickDaysNoVacunados: calculatedResults.sickDaysNoVacunados,
      empleadosIncapacidadNoVacunados: Math.round(
        calculatedResults.sickDaysNoVacunados / formVariables.diasIncapacidad
      ),
      empleadosIncapacidadVacunados: Math.round(
        calculatedResults.sickDaysVacunados / formVariables.diasIncapacidad
      ),
      salarioPromedio: formVariables.salarioPromedio,
      indicadorProductividad: formVariables.indicadorProductividad,
      diasIncapacidad: formVariables.diasIncapacidad,
      calculatedResults: calculatedResults,
    });

    // Guardar datos para resumen
    this.saveResultsForResumen(
      formVariables,
      calculatedResults,
      costoTotalVacunacion,
      totalVacunados,
      porcentajeVacunacion
    );

    // Actualizar DOM
    this.updateView2Results(
      formVariables,
      calculatedResults,
      costoTotalVacunacion,
      totalVacunados,
      porcentajeVacunacion
    );
    this.updateView3Results(
      formVariables,
      calculatedResults,
      costoTotalVacunacion
    );
  }

  /**
   * Guarda los resultados para la página de resumen
   */
  private static saveResultsForResumen(
    formVariables: FormVariables,
    calculatedResults: InfluenzaResults,
    costoTotalVacunacion: number,
    totalVacunados: number,
    porcentajeVacunacion: number
  ): void {
    const empleadosIncapacidadNoVacunados = Math.floor(
      calculatedResults.sickDaysNoVacunados / formVariables.diasIncapacidad
    );
    const empleadosIncapacidadVacunados = Math.floor(
      calculatedResults.sickDaysVacunados / formVariables.diasIncapacidad
    );

    const salariosAusentismoNoVacunados = Math.floor(
      empleadosIncapacidadNoVacunados * (formVariables.salarioPromedio / 30) * 2
    );
    const salariosAusentismoVacunados = Math.floor(
      empleadosIncapacidadVacunados * (formVariables.salarioPromedio / 30) * 2
    );

    const perdidaProductividadNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );
    const perdidaProductividadVacunados = Math.round(
      empleadosIncapacidadVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );

    const perdidasOperativasNoVacunados =
      salariosAusentismoNoVacunados + perdidaProductividadNoVacunados;
    const perdidasOperativasVacunados =
      salariosAusentismoVacunados + perdidaProductividadVacunados;

    const impactoPresupuestalNoVacunados = 0 + perdidasOperativasNoVacunados;
    const impactoPresupuestalVacunados =
      costoTotalVacunacion + perdidasOperativasVacunados;

    const ahorro =
      impactoPresupuestalNoVacunados - impactoPresupuestalVacunados;
    const relacionCostoBeneficio =
      (impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) /
        costoTotalVacunacion +
      1;

    const diasIncapacidadNoVacunados =
      empleadosIncapacidadNoVacunados * formVariables.diasIncapacidad;
    const diasIncapacidadVacunados =
      empleadosIncapacidadVacunados * formVariables.diasIncapacidad;
    const icer =
      (impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) /
      (diasIncapacidadNoVacunados - diasIncapacidadVacunados);

    const resumenData: ResumenData = {
      costoTotalVacunacion,
      perdidasOperativasNoVacunados,
      perdidasOperativasVacunados,
      perdidaProductividadNoVacunados,
      perdidaProductividadVacunados,
      porcentajeVacunacion,
      totalCasosNuevosNoVacunados: Math.floor(
        calculatedResults.totalCasosNuevosNoVacunados
      ),
      totalCasosNuevosVacunados: Math.floor(
        calculatedResults.totalCasosNuevosVacunados
      ),
      symptomaticNoVacunados: Math.floor(
        calculatedResults.symptomaticNoVacunados
      ),
      symptomaticVacunados: Math.floor(calculatedResults.symptomaticVacunados),
      sujetosIncapacitadosNoVacunados: empleadosIncapacidadNoVacunados,
      sujetosIncapacitadosVacunados: empleadosIncapacidadVacunados,
      sickDaysNoVacunados: Math.round(calculatedResults.sickDaysNoVacunados),
      sickDaysVacunados: Math.round(calculatedResults.sickDaysVacunados),
      hospitalizationNoVacunados: Math.floor(
        calculatedResults.hospitalizationNoVacunados
      ),
      hospitalizationVacunados: Math.floor(
        calculatedResults.hospitalizationVacunados
      ),
      mortalityNoVacunados: Math.floor(calculatedResults.mortalityNoVacunados),
      mortalityVacunados: Math.floor(calculatedResults.mortalityVacunados),
      ahorro,
      relacionCostoBeneficio,
      icer,
      timestamp: Date.now(),
    };

    StorageService.saveResumenData(resumenData);
  }

  /**
   * Actualiza los resultados de la vista 2 (Impacto Presupuestal)
   */
  private static updateView2Results(
    formVariables: FormVariables,
    calculatedResults: InfluenzaResults,
    costoTotalVacunacion: number,
    totalVacunados: number,
    porcentajeVacunacion: number
  ): void {
    const empleadosIncapacidadNoVacunados = Math.floor(
      calculatedResults.sickDaysNoVacunados / formVariables.diasIncapacidad
    );
    const empleadosIncapacidadVacunados = Math.floor(
      calculatedResults.sickDaysVacunados / formVariables.diasIncapacidad
    );

    const diasIncapacidadNoVacunados =
      empleadosIncapacidadNoVacunados * formVariables.diasIncapacidad;
    const diasIncapacidadVacunados =
      empleadosIncapacidadVacunados * formVariables.diasIncapacidad;

    const salariosAusentismoNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (formVariables.salarioPromedio / 30) * 2
    );
    const salariosAusentismoVacunados = Math.round(
      empleadosIncapacidadVacunados * (formVariables.salarioPromedio / 30) * 2
    );

    const perdidaProductividadNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );
    const perdidaProductividadVacunados = Math.round(
      empleadosIncapacidadVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );

    const perdidasOperativasNoVacunados =
      salariosAusentismoNoVacunados + perdidaProductividadNoVacunados;
    const perdidasOperativasVacunados =
      salariosAusentismoVacunados + perdidaProductividadVacunados;

    const impactoPresupuestalNoVacunados = 0 + perdidasOperativasNoVacunados;
    const impactoPresupuestalVacunados =
      costoTotalVacunacion + perdidasOperativasVacunados;

    const ahorro =
      impactoPresupuestalNoVacunados - impactoPresupuestalVacunados;

    const view2Updates = [
      {
        selector: "#view2 .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: totalVacunados.toLocaleString("es-CO"),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: DataFormatter.formatPercentage(porcentajeVacunacion),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(3) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(costoTotalVacunacion),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(4) > div:nth-child(2)",
        value: empleadosIncapacidadNoVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(4) > div:nth-child(3)",
        value: empleadosIncapacidadVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(5) > div:nth-child(2)",
        value: diasIncapacidadNoVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(5) > div:nth-child(3)",
        value: diasIncapacidadVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(6) > div:nth-child(2)",
        value: DataFormatter.formatCurrency(salariosAusentismoNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(6) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(salariosAusentismoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(7) > div:nth-child(2)",
        value: DataFormatter.formatCurrency(perdidaProductividadNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(7) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(perdidaProductividadVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(8) > div:nth-child(2)",
        value: "$ 0",
      },
      {
        selector: "#view2 .divide-y > div:nth-child(8) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(costoTotalVacunacion),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(9) > div:nth-child(2)",
        value: DataFormatter.formatCurrency(perdidasOperativasNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(9) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(perdidasOperativasVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(10) > div:nth-child(2)",
        value: DataFormatter.formatCurrency(impactoPresupuestalNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(10) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(impactoPresupuestalVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(11) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(ahorro),
      },
    ];

    view2Updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
      }
    });

    // Actualizar texto descriptivo
    const personasEvitadas = Math.round(
      empleadosIncapacidadNoVacunados - empleadosIncapacidadVacunados
    );
    const diasReducidos = diasIncapacidadNoVacunados - diasIncapacidadVacunados;

    const descriptiveText = `La inversión en vacunación para ${totalVacunados.toLocaleString(
      "es-CO"
    )} trabajadores es de ${DataFormatter.formatCurrency(
      costoTotalVacunacion
    )}, lo que cubre al ${porcentajeVacunacion.toFixed(
      1
    )}% de los colaboradores. Este nivel de protección evita que ${personasEvitadas} personas se enfermen y reduce en ${diasReducidos.toLocaleString(
      "es-CO"
    )} el número de días de incapacidad.`;

    const descriptiveElement = document.querySelector(
      "#view2 .bg-brown-influvac p"
    );
    if (descriptiveElement) {
      descriptiveElement.textContent = descriptiveText;
    }
  }

  /**
   * Actualiza los resultados de la vista 3 (Costo-Beneficio / Costo-Efectividad)
   */
  private static updateView3Results(
    formVariables: FormVariables,
    calculatedResults: InfluenzaResults,
    costoTotalVacunacion: number
  ): void {
    const empleadosIncapacidadNoVacunados = Math.floor(
      calculatedResults.sickDaysNoVacunados / formVariables.diasIncapacidad
    );
    const empleadosIncapacidadVacunados = Math.floor(
      calculatedResults.sickDaysVacunados / formVariables.diasIncapacidad
    );

    const diasIncapacidadNoVacunados =
      empleadosIncapacidadNoVacunados * formVariables.diasIncapacidad;
    const diasIncapacidadVacunados =
      empleadosIncapacidadVacunados * formVariables.diasIncapacidad;

    const salariosAusentismoNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (formVariables.salarioPromedio / 30) * 2
    );
    const salariosAusentismoVacunados = Math.round(
      empleadosIncapacidadVacunados * (formVariables.salarioPromedio / 30) * 2
    );

    const perdidaProductividadNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );
    const perdidaProductividadVacunados = Math.round(
      empleadosIncapacidadVacunados *
        (formVariables.indicadorProductividad / 30) *
        formVariables.diasIncapacidad
    );

    const perdidasOperativasNoVacunados =
      salariosAusentismoNoVacunados + perdidaProductividadNoVacunados;
    const perdidasOperativasVacunados =
      salariosAusentismoVacunados + perdidaProductividadVacunados;

    const impactoPresupuestalNoVacunados = 0 + perdidasOperativasNoVacunados;
    const impactoPresupuestalVacunados =
      costoTotalVacunacion + perdidasOperativasVacunados;

    const relacionCostoBeneficio =
      (impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) /
        costoTotalVacunacion +
      1;
    const icer =
      (impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) /
      (diasIncapacidadNoVacunados - diasIncapacidadVacunados);

    const view3Updates = [
      {
        selector:
          "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(costoTotalVacunacion),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(2) > div:nth-child(2)",
        value: DataFormatter.formatCurrency(impactoPresupuestalNoVacunados),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: DataFormatter.formatCurrency(impactoPresupuestalVacunados),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(3) > div:nth-child(2)",
        value: relacionCostoBeneficio.toFixed(2),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(1) > div:nth-child(2)",
        value: DataFormatter.formatCurrencyWithDecimals(
          impactoPresupuestalNoVacunados
        ),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: DataFormatter.formatCurrencyWithDecimals(
          impactoPresupuestalVacunados
        ),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(2) > div:nth-child(2)",
        value: DataFormatter.formatNumberWithDecimals(
          diasIncapacidadNoVacunados
        ),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: DataFormatter.formatNumberWithDecimals(diasIncapacidadVacunados),
      },
      {
        selector:
          "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(3) > div:nth-child(2)",
        value: DataFormatter.formatCurrencyWithDecimals(icer),
      },
    ];

    view3Updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
      }
    });

    // Actualizar textos descriptivos
    this.updateView3DescriptiveTexts(relacionCostoBeneficio, icer);
  }

  /**
   * Actualiza los textos descriptivos de la vista 3
   */
  private static updateView3DescriptiveTexts(
    relacionCostoBeneficio: number,
    icer: number
  ): void {
    // Actualizar texto costo-beneficio
    const allStrongs = document.querySelectorAll("#view3 strong");
    allStrongs.forEach((strong) => {
      if (strong.textContent && strong.textContent.includes("$30,68")) {
        strong.textContent = `$${relacionCostoBeneficio.toFixed(2)}`;
      }
      if (strong.textContent && strong.textContent.includes("$2.436.118")) {
        strong.textContent = `$${Math.round(icer).toLocaleString("es-CO")}`;
      }
    });
  }
}
