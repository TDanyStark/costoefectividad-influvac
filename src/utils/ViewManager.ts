import { URL_BASE } from "@/variables";

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

export class ViewManager {
  private currentView: string = "view1";
  private formData: any = null;
  private mainContainer: HTMLElement | null = null;
  private chartNoVacunar: any = null;
  private chartVacunacionTetravalente: any = null;

  // Variables calculadas para los resultados
  private calculatedResults: any = null;

  // Referencias a los elementos del formulario
  private form: HTMLFormElement | null = null;
  private formElements: {
    [key: string]: HTMLInputElement | HTMLSelectElement | null;
  } = {};
  private productivityDisplay: HTMLElement | null = null;

  // Variables por defecto del formulario (nunca cambian)
  private defaultFormVariables = {
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

  // Variables del formulario (estado actual)
  private formVariables: Record<string, any> = { ...this.defaultFormVariables };

  constructor() {
    this.mainContainer = document.getElementById("main-container");
    this.initializeFormElements();
    this.initializeNavigation();
    this.initializeCustomEvents();
    this.initializeFormVariables();
    this.populateFormFromVariables();
    this.initializeFormHandler();
    // Calcular resultados iniciales
    this.recalculateResults();
  }

  private initializeFormElements(): void {
    this.form = document.getElementById(
      "modelParametersForm"
    ) as HTMLFormElement;

    if (this.form) {
      // Mapeo más simple de elementos del formulario
      const formFields = [
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
      ];

      formFields.forEach((field) => {
        this.formElements[field] = this.form!.querySelector(
          `[name="${field}"]`
        );
      });

      this.productivityDisplay = document.querySelector(
        "#indicadorProductividad div.px-2"
      );
    }
  }

  private initializeFormVariables(): void {
    const savedFormData = this.loadFromLocalStorage();

    if (savedFormData && this.isValidFormData(savedFormData)) {
      this.formVariables = savedFormData;
    } else {
      this.formVariables = { ...this.defaultFormVariables };
    }
  }

  private loadFromLocalStorage(): any {
    try {
      const savedData = localStorage.getItem("influvac-form-data");
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error);
      localStorage.removeItem("influvac-form-data");
      return null;
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        "influvac-form-data",
        JSON.stringify(this.formVariables)
      );
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }

  private isValidFormData(data: any): boolean {
    const requiredProps = [
      "numEmpleados",
      "fecha1Vacunacion",
      "numeroDeVacunados1",
      "calculoProductividad",
      "ventaNeta",
      "salarioPromedio",
      "precioVacunacion",
      "nivelExposicion",
      "diasIncapacidad",
    ];
    return requiredProps.every((prop) => data.hasOwnProperty(prop));
  }

  private initializeNavigation(): void {
    const navButtons = document.querySelectorAll(".view-nav-btn");
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        const viewId = target.getAttribute("data-view");
        const bgImage = target.getAttribute("data-bg");

        if (viewId) {
          this.switchView(viewId, bgImage);
        }
      });
    });
  }

  private initializeFormHandler(): void {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
      this.initializeProductivityUpdaters();
    }
  }

  private initializeProductivityUpdaters(): void {
    const cleanNumericValue = (value: string): number => {
      return parseInt(value.replace(/\./g, "")) || 0;
    };

    const updateProductivity = () => {
      let indicadorProductividad = 0;

      if (
        this.formVariables.calculoProductividad === "productividad_individual"
      ) {
        indicadorProductividad = this.formVariables.ventaNeta;
      } else {
        if (this.formVariables.numEmpleados > 0) {
          indicadorProductividad =
            this.formVariables.ventaNeta / this.formVariables.numEmpleados / 12;
        }
      }

      this.formVariables.indicadorProductividad = indicadorProductividad;
      this.updateProductivityDisplay();
    };

    // Configurar listeners para campos numéricos
    const numericFields = [
      "numEmpleados",
      "numeroDeVacunados1",
      "numeroDeVacunados2",
      "ventaNeta",
      "salarioPromedio",
      "precioVacunacion",
      "diasIncapacidad",
    ];

    numericFields.forEach((field) => {
      const element = this.formElements[field] as HTMLInputElement;
      if (element) {
        const updateField = () => {
          this.formVariables[field] = cleanNumericValue(element.value);
          if (
            ["numEmpleados", "ventaNeta", "calculoProductividad"].includes(
              field
            )
          ) {
            updateProductivity();
          }
          this.saveToLocalStorage();
          // Recalcular resultados cuando cambien valores relevantes
          this.recalculateResults();
        };

        element.addEventListener("input", updateField);
        element.addEventListener("change", updateField);
      }
    });

    // Listeners para campos de texto y selects
    const textFields = [
      "fecha1Vacunacion",
      "fecha2Vacunacion",
      "calculoProductividad",
      "nivelExposicion",
    ];
    textFields.forEach((field) => {
      const element = this.formElements[field];
      if (element) {
        element.addEventListener("change", () => {
          this.formVariables[field] = element.value;
          if (field === "calculoProductividad") updateProductivity();
          this.saveToLocalStorage();
          // Recalcular resultados cuando cambien valores relevantes
          this.recalculateResults();
        });
      }
    });

    updateProductivity();
  }

  private initializeCustomEvents(): void {
    document.addEventListener("switchToView", (e: any) => {
      const { viewId } = e.detail;
      const bgMap: { [key: string]: string } = {
        view2: "banner3",
        view3: "banner4",
        view4: "banner5",
      };
      this.switchView(viewId, bgMap[viewId] || "banner2");
    });

    document.addEventListener("formReset", () => {
      setTimeout(() => this.resetFormToDefaults(), 100);
    });
  }

  private populateFormFromVariables(): void {
    const formatWithThousands = (value: number): string => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const formatDateForInput = (dateStr: string): string => {
      return dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? dateStr : "";
    };

    if (!this.form) return;

    // Poblar campos de forma más eficiente
    Object.keys(this.formElements).forEach((field) => {
      const element = this.formElements[field];
      if (element && this.formVariables[field] !== undefined) {
        const value = this.formVariables[field];

        if (field.includes("fecha")) {
          element.value = formatDateForInput(value);
        } else if (
          typeof value === "number" &&
          ["ventaNeta", "salarioPromedio", "precioVacunacion"].includes(field)
        ) {
          element.value = formatWithThousands(value);
        } else {
          element.value = value.toString();
        }
      }
    });

    // Disparar evento change para calculoProductividad
    const calcElement = this.formElements.calculoProductividad;
    if (calcElement) {
      calcElement.dispatchEvent(new Event("change"));
    }

    this.updateProductivityDisplay();
  }

  private resetFormToDefaults(): void {
    this.formVariables = { ...this.defaultFormVariables };
    localStorage.removeItem("influvac-form-data");
    this.populateFormFromVariables();
  }

  private updateProductivityDisplay(): void {
    if (this.productivityDisplay) {
      this.productivityDisplay.textContent =
        this.formVariables.indicadorProductividad.toLocaleString("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
  }

  private switchView(viewId: string, bgImage?: string | null): void {
    if (this.currentView === "view4") {
      this.cleanupCharts();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (bgImage && this.mainContainer) {
      const urlBase = URL_BASE || "";
      this.mainContainer.style.backgroundImage = `url('${urlBase}/img/bg/${bgImage}.webp')`;
    }

    const currentViewElement = document.getElementById(this.currentView);
    const newViewElement = document.getElementById(viewId);

    currentViewElement?.classList.add("hidden");
    currentViewElement?.classList.remove("active");
    newViewElement?.classList.remove("hidden");
    newViewElement?.classList.add("active");

    this.currentView = viewId;
    this.updateLogo(viewId);
    this.loadViewContent(viewId);
  }

  private handleFormSubmit(): void {
    this.extractFormValues();
    this.calculateResults();
  }

  private recalculateResults(): void {
    // Recalcular solo si tenemos los datos necesarios
    if (
      this.formVariables.numEmpleados &&
      this.formVariables.fecha1Vacunacion &&
      this.formVariables.numeroDeVacunados1 >= 0
    ) {
      this.extractFormValues();
      this.calculateResults();
    }
  }

  private extractFormValues(): void {
    if (
      this.formVariables.calculoProductividad === "productividad_individual"
    ) {
      this.formVariables.indicadorProductividad = this.formVariables.ventaNeta;
    } else {
      this.formVariables.indicadorProductividad =
        this.formVariables.numEmpleados > 0
          ? this.formVariables.ventaNeta / this.formVariables.numEmpleados / 12
          : 0;
    }
  }

  private calculateInfluenzaResults(): any {
    const numEmpleados = this.formVariables.numEmpleados;
    const firstVaccinationDate = this.formVariables.fecha1Vacunacion;
    const firstvaccinatedIndividuals = this.formVariables.numeroDeVacunados1;
    const secondVaccinationDate = this.formVariables.fecha2Vacunacion;
    const secondvaccinatedIndividuals = this.formVariables.numeroDeVacunados2;
    const nivelExposicion = this.formVariables.nivelExposicion;
    const diasIncapacidad = this.formVariables.diasIncapacidad;

    const year = new Date(firstVaccinationDate).getFullYear();
    const isLeap = (y: number) =>
      y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const diasEnAnio = isLeap(year) ? 366 : 365;

    // Validar primera fecha
    const firstDate = new Date(firstVaccinationDate);
    if (isNaN(firstDate.getTime())) {
      throw new Error("❌ La primera fecha no es válida");
    }

    // Declarar fuera para poder usar después
    let secondDate: Date | null = null;

    // Validar segunda fecha solo si existe
    if (secondVaccinationDate) {
      secondDate = new Date(secondVaccinationDate);

      if (isNaN(secondDate.getTime())) {
        throw new Error("❌ La segunda fecha no es válida");
      }

      if (firstDate.getFullYear() !== secondDate.getFullYear()) {
        throw new Error("❌ Las fechas no son del mismo año");
      }

      if (secondDate <= firstDate) {
        throw new Error("❌ La segunda fecha debe ser mayor que la primera");
      }
    }

    // Crear objeto final
    const vaccinationObject: {
      firstVaccinationDate: Date;
      firstvaccinatedIndividuals: number;
      secondVaccinationDate: Date | null;
      secondvaccinatedIndividuals: number;
    } = {
      firstVaccinationDate: firstDate,
      firstvaccinatedIndividuals,
      secondVaccinationDate: secondDate,
      secondvaccinatedIndividuals,
    };

    const ajustePoblacionalResult = ajustePoblacional(
      numEmpleados,
      nivelExposicion
    );

    const influenzaAH1N1 = generateinfluenzaAH1N1(
      numEmpleados,
      ajustePoblacionalResult["A H1N1"]
    );
    const influenzaAH1N1_V = generateinfluenzaAH1N1_V(
      numEmpleados,
      ajustePoblacionalResult["A H1N1"],
      vaccinationObject
    );

    const influenzaAH3N2 = generateinfluenzaAH3N2(
      numEmpleados,
      ajustePoblacionalResult["A H3N2"]
    );
    const influenzaAH3N2_V = generateinfluenzaAH3N2_V(
      numEmpleados,
      ajustePoblacionalResult["A H3N2"],
      vaccinationObject
    );

    const influenzaBVictoria = generateInfluenzaBVictoria(
      numEmpleados,
      ajustePoblacionalResult["B Victoria"]
    );
    const influenzaBVictoria_V = generateInfluenzaBVictoria_V(
      numEmpleados,
      ajustePoblacionalResult["B Victoria"],
      vaccinationObject
    );

    const influenzaBYamagata = generateInfluenzaBYamagata(
      numEmpleados,
      ajustePoblacionalResult["B Yamagata"]
    );
    const influenzaBYamagata_V = generateInfluenzaBYamagata_V(
      numEmpleados,
      ajustePoblacionalResult["B Yamagata"],
      vaccinationObject
    );

    const noVacunal = generateNoVacunal(
      numEmpleados,
      ajustePoblacionalResult["No vacunal"]
    );

    // Sumar "Casos Nuevos" de cada serie
    type SerieItem = { [k: string]: any; "Casos Nuevos": number };
    const sumCasosNuevos = (serie: Array<SerieItem>) =>
      serie.reduce((acc, item) => acc + (item["Casos Nuevos"] || 0), 0);

    const totalCasosNuevosInfluenzaAH1N1 = sumCasosNuevos(influenzaAH1N1);
    const totalCasosNuevosInfluenzaAH1N1_V = sumCasosNuevos(influenzaAH1N1_V);

    const totalCasosNuevosInfluenzaAH3N2 = sumCasosNuevos(influenzaAH3N2);
    const totalCasosNuevosInfluenzaAH3N2_V = sumCasosNuevos(influenzaAH3N2_V);

    const totalCasosNuevosInfluenzaBVictoria =
      sumCasosNuevos(influenzaBVictoria);
    const totalCasosNuevosInfluenzaBVictoria_V =
      sumCasosNuevos(influenzaBVictoria_V);

    const totalCasosNuevosInfluenzaBYamagata =
      sumCasosNuevos(influenzaBYamagata);
    const totalCasosNuevosInfluenzaBYamagata_V =
      sumCasosNuevos(influenzaBYamagata_V);

    const totalCasosNuevosNoVacunal = sumCasosNuevos(noVacunal);

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

    // Sintomáticos (redondeados a enteros)
    const symptomaticVacunados = totalCasosNuevosVacunados * 0.84;
    const symptomaticNoVacunados = totalCasosNuevosNoVacunados * 0.84;

    // Días de incapacidad (redondeados)
    const sickDaysVacunados = symptomaticVacunados * 0.4865 * diasIncapacidad;
    const sickDaysNoVacunados = symptomaticNoVacunados * 0.4865 * diasIncapacidad;

    // Hospitalizaciones (redondeados)
    const hospitalizationVacunados = symptomaticVacunados * 0.0154;
    const hospitalizationNoVacunados = symptomaticNoVacunados * 0.0154;

    // Mortalidad (redondeados)
    const mortalityVacunados = symptomaticVacunados * 0.00127;
    const mortalityNoVacunados = symptomaticNoVacunados * 0.00127;

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
    };
  }

  private calculateResults(): void {
    try {
      // Calcular los resultados de influenza
      this.calculatedResults = this.calculateInfluenzaResults();

      // Cálculos básicos
      const totalVacunados =
        this.formVariables.numeroDeVacunados1 +
        this.formVariables.numeroDeVacunados2;
      const porcentajeVacunacion =
        (totalVacunados / this.formVariables.numEmpleados) * 100;
      const costoTotalVacunacion = Math.round(
        totalVacunados * this.formVariables.precioVacunacion
      );

      console.log("Cálculos realizados:", {
        totalVacunados: totalVacunados.toLocaleString("es-CO"),
        porcentajeVacunacion: porcentajeVacunacion.toFixed(2) + "%",
        costoTotalVacunacion:
          "$" + costoTotalVacunacion.toLocaleString("es-CO"),
        sickDaysVacunados: this.calculatedResults.sickDaysVacunados,
        sickDaysNoVacunados: this.calculatedResults.sickDaysNoVacunados,
        empleadosIncapacidadNoVacunados: Math.round(this.calculatedResults.sickDaysNoVacunados / this.formVariables.diasIncapacidad),
        empleadosIncapacidadVacunados: Math.round(this.calculatedResults.sickDaysVacunados / this.formVariables.diasIncapacidad),
        salarioPromedio: this.formVariables.salarioPromedio,
        indicadorProductividad: this.formVariables.indicadorProductividad,
        diasIncapacidad: this.formVariables.diasIncapacidad,
        // Información adicional para depuración
        calculatedResults: this.calculatedResults
      });

      // Actualizar resultados en el DOM
      setTimeout(
        () =>
          this.updateResultsInDOM(
            costoTotalVacunacion,
            totalVacunados,
            porcentajeVacunacion
          ),
        500
      );
    } catch (error) {
      console.error("Error en los cálculos:", error);
    }
  }

  private updateResultsInDOM(
    costoTotalVacunacion: number,
    totalVacunados: number,
    porcentajeVacunacion: number
  ): void {
    // Actualizar vista 2 - Impacto Presupuestal
    this.updateView2Results(
      costoTotalVacunacion,
      totalVacunados,
      porcentajeVacunacion
    );

    // Actualizar vista 3 - Costo-Beneficio / Costo-Efectividad
    this.updateView3Results(costoTotalVacunacion);

    // Mantener las actualizaciones originales para otras vistas si existen
    const updates = [
      {
        id: "resultado-ahorro-total",
        value: `$${(costoTotalVacunacion * 2.5).toLocaleString("es-CO")}`,
      },
      { id: "resultado-roi", value: "320%" },
      { id: "resultado-costo-beneficio", value: "3.2:1" },
      {
        id: "resultado-costo-caso-evitado",
        value: `$${(
          costoTotalVacunacion / Math.max(totalVacunados * 0.1, 1)
        ).toLocaleString("es-CO")}`,
      },
      { id: "resultado-efectividad", value: "85%" },
    ];

    updates.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    this.updateCasesResults(totalVacunados);
  }

  private updateView2Results(
    costoTotalVacunacion: number,
    totalVacunados: number,
    porcentajeVacunacion: number
  ): void {
    if (!this.calculatedResults) return;

    const formatCurrency = (amount: number): string => {
      return `$ ${Math.round(amount).toLocaleString("es-CO")}`;
    };

    const formatPercentage = (percentage: number): string => {
      return `${percentage.toFixed(2)}%`;
    };

    // Calcular empleados con incapacidad médica
    const empleadosIncapacidadNoVacunados = Math.floor(
      this.calculatedResults.sickDaysNoVacunados /
        this.formVariables.diasIncapacidad
    );
    const empleadosIncapacidadVacunados = Math.floor(
      this.calculatedResults.sickDaysVacunados /
        this.formVariables.diasIncapacidad
    );
    console.log(this.calculatedResults.sickDaysVacunados, empleadosIncapacidadVacunados);
    // Calcular días de incapacidad médica
    const diasIncapacidadNoVacunados =
      empleadosIncapacidadNoVacunados * this.formVariables.diasIncapacidad;
    const diasIncapacidadVacunados =
      empleadosIncapacidadVacunados * this.formVariables.diasIncapacidad;

    // Calcular salarios pagados en ausentismo
    const salariosAusentismoNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (this.formVariables.salarioPromedio / 30) * 2
    );
    const salariosAusentismoVacunados = Math.round(
      empleadosIncapacidadVacunados * (this.formVariables.salarioPromedio / 30) * 2
    );

    // Calcular pérdida de productividad
    const perdidaProductividadNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (this.formVariables.indicadorProductividad / 30) * this.formVariables.diasIncapacidad
    );
    const perdidaProductividadVacunados = Math.round(
      empleadosIncapacidadVacunados * (this.formVariables.indicadorProductividad / 30) * this.formVariables.diasIncapacidad
    );

    // Calcular pérdidas operativas (fila 6 + fila 7)
    const perdidasOperativasNoVacunados = salariosAusentismoNoVacunados + perdidaProductividadNoVacunados;
    const perdidasOperativasVacunados = salariosAusentismoVacunados + perdidaProductividadVacunados;

    // Calcular impacto presupuestal (fila 8 + fila 9)
    const impactoPresupuestalNoVacunados = 0 + perdidasOperativasNoVacunados; // gastos vacunación = 0 para no vacunados
    const impactoPresupuestalVacunados = costoTotalVacunacion + perdidasOperativasVacunados;

    // Calcular ahorro (fila 10 no vacunados - fila 10 vacunados)
    const ahorro = impactoPresupuestalNoVacunados - impactoPresupuestalVacunados;

    // Mapeo de selectores CSS a valores
    const view2Updates = [
      // Población Vacunada - fila 1
      {
        selector: "#view2 .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: totalVacunados.toLocaleString("es-CO"),
      },

      // Porcentaje de vacunación - fila 2
      {
        selector: "#view2 .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: formatPercentage(porcentajeVacunacion),
      },

      // Costo de la vacunación - fila 3
      {
        selector: "#view2 .divide-y > div:nth-child(3) > div:nth-child(3)",
        value: formatCurrency(costoTotalVacunacion),
      },

      // Empleados con incapacidad médica - fila 4
      {
        selector: "#view2 .divide-y > div:nth-child(4) > div:nth-child(2)",
        value: empleadosIncapacidadNoVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(4) > div:nth-child(3)",
        value: empleadosIncapacidadVacunados.toString(),
      },

      // Días de incapacidad médica - fila 5
      {
        selector: "#view2 .divide-y > div:nth-child(5) > div:nth-child(2)",
        value: diasIncapacidadNoVacunados.toString(),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(5) > div:nth-child(3)",
        value: diasIncapacidadVacunados.toString(),
      },

      // Salarios pagados en ausentismo - fila 6
      {
        selector: "#view2 .divide-y > div:nth-child(6) > div:nth-child(2)",
        value: formatCurrency(salariosAusentismoNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(6) > div:nth-child(3)",
        value: formatCurrency(salariosAusentismoVacunados),
      },

      // Pérdida de productividad - fila 7
      {
        selector: "#view2 .divide-y > div:nth-child(7) > div:nth-child(2)",
        value: formatCurrency(perdidaProductividadNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(7) > div:nth-child(3)",
        value: formatCurrency(perdidaProductividadVacunados),
      },

      // Gastos de vacunación - fila 8 (igual que fila 3)
      {
        selector: "#view2 .divide-y > div:nth-child(8) > div:nth-child(2)",
        value: "$ 0",
      },
      {
        selector: "#view2 .divide-y > div:nth-child(8) > div:nth-child(3)",
        value: formatCurrency(costoTotalVacunacion),
      },

      // Pérdidas Operativas - fila 9
      {
        selector: "#view2 .divide-y > div:nth-child(9) > div:nth-child(2)",
        value: formatCurrency(perdidasOperativasNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(9) > div:nth-child(3)",
        value: formatCurrency(perdidasOperativasVacunados),
      },

      // Impacto presupuestal - fila 10
      {
        selector: "#view2 .divide-y > div:nth-child(10) > div:nth-child(2)",
        value: formatCurrency(impactoPresupuestalNoVacunados),
      },
      {
        selector: "#view2 .divide-y > div:nth-child(10) > div:nth-child(3)",
        value: formatCurrency(impactoPresupuestalVacunados),
      },

      // Ahorro - última fila
      {
        selector: "#view2 .divide-y > div:nth-child(11) > div:nth-child(3)",
        value: formatCurrency(ahorro),
      },
    ];

    view2Updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
      }
    });

    // Actualizar el texto descriptivo de la vista 2
    const personasEvitadas = Math.round(empleadosIncapacidadNoVacunados - empleadosIncapacidadVacunados);
    const diasReducidos = diasIncapacidadNoVacunados - diasIncapacidadVacunados;
    
    const descriptiveText = `La inversión en vacunación para ${totalVacunados.toLocaleString("es-CO")} trabajadores es de ${formatCurrency(costoTotalVacunacion)}, lo que cubre al ${porcentajeVacunacion.toFixed(1)}% de los colaboradores. Este nivel de protección evita que ${personasEvitadas} personas se enfermen y reduce en ${diasReducidos.toLocaleString("es-CO")} el número de días de incapacidad.`;
    
    const descriptiveElement = document.querySelector('#view2 .bg-brown-influvac p');
    if (descriptiveElement) {
      descriptiveElement.textContent = descriptiveText;
      console.log('Actualizado texto descriptivo vista 2:', descriptiveText);
    } else {
      console.log('No se encontró el elemento para actualizar el texto descriptivo de la vista 2');
    }
  }

  private updateView3Results(costoTotalVacunacion: number): void {
    if (!this.calculatedResults) return;

    const formatCurrency = (amount: number): string => {
      return `$ ${Math.round(amount).toLocaleString("es-CO")}`;
    };

    const formatCurrencyWithDecimals = (amount: number): string => {
      return `$ ${amount.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };

    // Calcular empleados con incapacidad médica (mismos cálculos que vista 2)
    const empleadosIncapacidadNoVacunados = Math.floor(
      this.calculatedResults.sickDaysNoVacunados /
        this.formVariables.diasIncapacidad
    );
    const empleadosIncapacidadVacunados = Math.floor(
      this.calculatedResults.sickDaysVacunados /
        this.formVariables.diasIncapacidad
    );

    // Calcular días de incapacidad médica
    const diasIncapacidadNoVacunados =
      empleadosIncapacidadNoVacunados * this.formVariables.diasIncapacidad;
    const diasIncapacidadVacunados =
      empleadosIncapacidadVacunados * this.formVariables.diasIncapacidad;

    // Calcular todos los valores intermedios (mismos cálculos que vista 2)
    const salariosAusentismoNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (this.formVariables.salarioPromedio / 30) * 2
    );
    const salariosAusentismoVacunados = Math.round(
      empleadosIncapacidadVacunados * (this.formVariables.salarioPromedio / 30) * 2
    );

    const perdidaProductividadNoVacunados = Math.round(
      empleadosIncapacidadNoVacunados * (this.formVariables.indicadorProductividad / 30) * this.formVariables.diasIncapacidad
    );
    const perdidaProductividadVacunados = Math.round(
      empleadosIncapacidadVacunados * (this.formVariables.indicadorProductividad / 30) * this.formVariables.diasIncapacidad
    );

    const perdidasOperativasNoVacunados = salariosAusentismoNoVacunados + perdidaProductividadNoVacunados;
    const perdidasOperativasVacunados = salariosAusentismoVacunados + perdidaProductividadVacunados;

    const impactoPresupuestalNoVacunados = 0 + perdidasOperativasNoVacunados;
    const impactoPresupuestalVacunados = costoTotalVacunacion + perdidasOperativasVacunados;

    // Calcular relación costo-beneficio
    const relacionCostoBeneficio = ((impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) / costoTotalVacunacion) + 1;

    // Calcular ICER
    const icer = (impactoPresupuestalNoVacunados - impactoPresupuestalVacunados) / (diasIncapacidadNoVacunados - diasIncapacidadVacunados);

    console.log('Vista 3 - Cálculos:', {
      impactoPresupuestalNoVacunados,
      impactoPresupuestalVacunados,
      relacionCostoBeneficio,
      diasIncapacidadNoVacunados,
      diasIncapacidadVacunados,
      icer,
      icerFormatted: `$${Math.round(icer).toLocaleString("es-CO")}`
    });

    // Mapeo de selectores CSS a valores para vista 3
    const view3Updates = [
      // Primera tabla - Costo de la vacunación - fila 1
      {
        selector: "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: formatCurrency(costoTotalVacunacion),
      },

      // Primera tabla - Gasto Total - fila 2
      {
        selector: "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(2) > div:nth-child(2)",
        value: formatCurrency(impactoPresupuestalNoVacunados),
      },
      {
        selector: "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: formatCurrency(impactoPresupuestalVacunados),
      },

      // Primera tabla - Relación costo-beneficio - fila 3
      {
        selector: "#view3 .bg-white:nth-of-type(1) .divide-y > div:nth-child(3) > div:nth-child(2)",
        value: relacionCostoBeneficio.toFixed(2),
      },

      // Segunda tabla - Gasto Total - fila 1
      {
        selector: "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(1) > div:nth-child(2)",
        value: formatCurrencyWithDecimals(impactoPresupuestalNoVacunados),
      },
      {
        selector: "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(1) > div:nth-child(3)",
        value: formatCurrencyWithDecimals(impactoPresupuestalVacunados),
      },

      // Segunda tabla - Días de incapacidad - fila 2
      {
        selector: "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(2) > div:nth-child(2)",
        value: diasIncapacidadNoVacunados.toLocaleString("es-CO", {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      },
      {
        selector: "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(2) > div:nth-child(3)",
        value: diasIncapacidadVacunados.toLocaleString("es-CO", {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      },

      // Segunda tabla - ICER - fila 3
      {
        selector: "#view3 .bg-white:nth-of-type(3) .divide-y > div:nth-child(3) > div:nth-child(2)",
        value: formatCurrencyWithDecimals(icer),
      },
    ];

    view3Updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
      }
    });

    // Actualizar el texto descriptivo
    const textElement = document.querySelector('#view3 .bg-white:nth-of-type(2) p span strong:nth-of-type(2)');
    if (textElement) {
      textElement.textContent = `$${relacionCostoBeneficio.toFixed(2)}`;
      console.log('Actualizado texto costo-beneficio:', `$${relacionCostoBeneficio.toFixed(2)}`);
    } else {
      console.log('No se encontró el elemento para actualizar el texto costo-beneficio');
      // Buscar todos los elementos strong en la vista 3 y actualizar el que contiene $30,68
      const allStrongs = document.querySelectorAll('#view3 strong');
      allStrongs.forEach((strong, index) => {
        if (strong.textContent && strong.textContent.includes('$30,68')) {
          strong.textContent = `$${relacionCostoBeneficio.toFixed(2)}`;
          console.log(`Actualizado costo-beneficio usando búsqueda por contenido (elemento ${index}):`, `$${relacionCostoBeneficio.toFixed(2)}`);
        }
      });
    }

    // Actualizar el texto descriptivo de la segunda sección con múltiples enfoques
    const textElement2 = document.querySelector('#view3 .bg-white:nth-of-type(4) p span strong');
    if (textElement2) {
      textElement2.textContent = `$${Math.round(icer).toLocaleString("es-CO")}`;
      console.log('Actualizado texto ICER:', `$${Math.round(icer).toLocaleString("es-CO")}`);
    } else {
      console.log('No se encontró el elemento para actualizar el texto ICER');
      // Intentar con un selector más específico
      const textElement2Alt = document.querySelector('#view3 .bg-white:last-child p span strong');
      if (textElement2Alt) {
        textElement2Alt.textContent = `$${Math.round(icer).toLocaleString("es-CO")}`;
        console.log('Actualizado texto ICER con selector alternativo:', `$${Math.round(icer).toLocaleString("es-CO")}`);
      } else {
        // Buscar todos los elementos strong en la vista 3 y actualizar el que contiene el valor ICER
        const allStrongs = document.querySelectorAll('#view3 strong');
        allStrongs.forEach((strong, index) => {
          if (strong.textContent && strong.textContent.includes('$2.436.118')) {
            strong.textContent = `$${Math.round(icer).toLocaleString("es-CO")}`;
            console.log(`Actualizado ICER usando búsqueda por contenido (elemento ${index}):`, `$${Math.round(icer).toLocaleString("es-CO")}`);
          }
        });
      }
    }
  }

  private updateCasesResults(totalVacunados: number): void {
    const factorExposicion = this.formVariables.nivelExposicion;
    const baseCase = Math.round(
      (this.formVariables.numEmpleados - totalVacunados) *
        0.01 *
        factorExposicion
    );

    const cases = [
      { id: "casos-h1n1", factor: 1.2 },
      { id: "casos-h3n2", factor: 1.0 },
      { id: "casos-b-victoria", factor: 0.8 },
      { id: "casos-b-yamagata", factor: 0.9 },
    ];

    cases.forEach(({ id, factor }) => {
      const element = document.getElementById(id);
      if (element)
        element.textContent = Math.round(baseCase * factor).toString();
    });
  }

  private loadViewContent(viewId: string): void {
    if (viewId === "view4") {
      this.loadChartsView4();
    }
  }

  private loadChartsView4(): void {
    const checkChart = () => {
      if (typeof (window as any).Chart !== "undefined") {
        this.createInfluenzaCharts();
      } else {
        setTimeout(checkChart, 100);
      }
    };
    checkChart();
  }

  private cleanupCharts(): void {
    [this.chartNoVacunar, this.chartVacunacionTetravalente].forEach((chart) => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    });
  }

  private createInfluenzaCharts(): void {
    this.cleanupCharts();

    const days = Array.from({ length: 365 }, (_, i) => i + 1);
    const generateData = (multiplier: number) => ({
      activos: days.map(
        (day) =>
          Math.max(0, Math.sin(day * 0.02) * 15 + Math.random() * 5) *
          multiplier
      ),
      ah1n1: days.map(
        (day) =>
          Math.max(0, Math.sin(day * 0.015) * 12 + Math.random() * 3) *
          multiplier
      ),
      ah3n2: days.map(
        (day) =>
          Math.max(0, Math.sin(day * 0.025) * 10 + Math.random() * 4) *
          multiplier
      ),
      victoria: days.map(
        (day) =>
          Math.max(0, Math.sin(day * 0.018) * 8 + Math.random() * 2) *
          multiplier
      ),
      yamagata: days.map(
        (day) =>
          Math.max(0, Math.sin(day * 0.022) * 6 + Math.random() * 3) *
          multiplier
      ),
    });

    const noVacunarData = generateData(2.5);
    const vacunacionData = generateData(0.8);

    const createChart = (canvasId: string, data: any) => {
      const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!ctx) return null;

      return new (window as any).Chart(ctx, {
        type: "line",
        data: {
          labels: days,
          datasets: [
            {
              label: "Activos",
              data: data.activos,
              borderColor: "#FF6B6B",
              backgroundColor: "#FF6B6B20",
              tension: 0.3,
              fill: true,
            },
            {
              label: "AH1N1",
              data: data.ah1n1,
              borderColor: "#4ECDC4",
              backgroundColor: "#4ECDC420",
              tension: 0.3,
              fill: true,
            },
            {
              label: "AH3N2",
              data: data.ah3n2,
              borderColor: "#45B7D1",
              backgroundColor: "#45B7D120",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Victoria",
              data: data.victoria,
              borderColor: "#F7DC6F",
              backgroundColor: "#F7DC6F20",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Yamagata",
              data: data.yamagata,
              borderColor: "#BB8FCE",
              backgroundColor: "#BB8FCE20",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom" as const,
              labels: { usePointStyle: true, padding: 15, font: { size: 11 } },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Días del año",
                font: { size: 12, weight: "bold" },
              },
              ticks: { maxTicksLimit: 12 },
            },
            y: {
              title: {
                display: true,
                text: "Número de casos",
                font: { size: 12, weight: "bold" },
              },
              beginAtZero: true,
            },
          },
        },
      });
    };

    this.chartNoVacunar = createChart("chart-no-vacunar", noVacunarData);
    this.chartVacunacionTetravalente = createChart(
      "chart-vacunacion-tetravalente",
      vacunacionData
    );
  }

  private updateLogo(currentView: string): void {
    const logo = document.getElementById("dynamic-logo") as HTMLImageElement;
    if (!logo) return;

    const whiteLogo = logo.getAttribute("data-white-logo");
    const colorLogo = logo.getAttribute("data-color-logo");

    if (!whiteLogo || !colorLogo) return;

    logo.src =
      currentView === "view1" || currentView === "view4"
        ? whiteLogo
        : colorLogo;
  }
}
