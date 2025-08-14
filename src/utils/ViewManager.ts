import { URL_BASE } from "@/variables";

export class ViewManager {
  private currentView: string = "view1";
  private formData: any = null;
  private mainContainer: HTMLElement | null = null;
  private chartNoVacunar: any = null;
  private chartVacunacionTetravalente: any = null;
  
  // Referencias a los elementos del formulario
  private form: HTMLFormElement | null = null;
  private formElements: {[key: string]: HTMLInputElement | HTMLSelectElement | null} = {};
  private productivityDisplay: HTMLElement | null = null;
  
  // Variables por defecto del formulario (nunca cambian)
  private defaultFormVariables = {
    numEmpleados: 5000,
    fecha1Vacunacion: "2025-05-30",
    numeroDeVacunados1: 2000,
    fecha2Vacunacion: '',
    numeroDeVacunados2: 0,
    calculoProductividad: "promedio_empresarial",
    ventaNeta: 4388774488000,
    indicadorProductividad: 73146241.47,
    salarioPromedio: 6000000,
    precioVacunacion: 55000,
    nivelExposicion: 2,
    diasIncapacidad: 5
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
  }

  private initializeFormElements(): void {
    this.form = document.getElementById("modelParametersForm") as HTMLFormElement;
    
    if (this.form) {
      // Mapeo más simple de elementos del formulario
      const formFields = [
        'numEmpleados', 'fecha1Vacunacion', 'numeroDeVacunados1',
        'fecha2Vacunacion', 'numeroDeVacunados2', 'calculoProductividad',
        'ventaNeta', 'salarioPromedio', 'precioVacunacion',
        'nivelExposicion', 'diasIncapacidad'
      ];
      
      formFields.forEach(field => {
        this.formElements[field] = this.form!.querySelector(`[name="${field}"]`);
      });
      
      this.productivityDisplay = document.querySelector('#indicadorProductividad div.px-2');
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
      const savedData = localStorage.getItem('influvac-form-data');
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
      localStorage.removeItem('influvac-form-data');
      return null;
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('influvac-form-data', JSON.stringify(this.formVariables));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private isValidFormData(data: any): boolean {
    const requiredProps = [
      'numEmpleados', 'fecha1Vacunacion', 'numeroDeVacunados1',
      'calculoProductividad', 'ventaNeta', 'salarioPromedio',
      'precioVacunacion', 'nivelExposicion', 'diasIncapacidad'
    ];
    return requiredProps.every(prop => data.hasOwnProperty(prop));
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
      return parseInt(value.replace(/\./g, '')) || 0;
    };

    const updateProductivity = () => {
      let indicadorProductividad = 0;
      
      if (this.formVariables.calculoProductividad === "productividad_individual") {
        indicadorProductividad = this.formVariables.ventaNeta;
      } else {
        if (this.formVariables.numEmpleados > 0) {
          indicadorProductividad = (this.formVariables.ventaNeta / this.formVariables.numEmpleados) / 12;
        }
      }
      
      this.formVariables.indicadorProductividad = indicadorProductividad;
      this.updateProductivityDisplay();
    };

    // Configurar listeners para campos numéricos
    const numericFields = ['numEmpleados', 'numeroDeVacunados1', 'numeroDeVacunados2', 
                          'ventaNeta', 'salarioPromedio', 'precioVacunacion', 'diasIncapacidad'];
    
    numericFields.forEach(field => {
      const element = this.formElements[field] as HTMLInputElement;
      if (element) {
        const updateField = () => {
          this.formVariables[field] = cleanNumericValue(element.value);
          if (['numEmpleados', 'ventaNeta', 'calculoProductividad'].includes(field)) {
            updateProductivity();
          }
          this.saveToLocalStorage();
        };
        
        element.addEventListener('input', updateField);
        element.addEventListener('change', updateField);
      }
    });

    // Listeners para campos de texto y selects
    const textFields = ['fecha1Vacunacion', 'fecha2Vacunacion', 'calculoProductividad', 'nivelExposicion'];
    textFields.forEach(field => {
      const element = this.formElements[field];
      if (element) {
        element.addEventListener('change', () => {
          this.formVariables[field] = element.value;
          if (field === 'calculoProductividad') updateProductivity();
          this.saveToLocalStorage();
        });
      }
    });

    updateProductivity();
  }

  private initializeCustomEvents(): void {
    document.addEventListener("switchToView", (e: any) => {
      const { viewId } = e.detail;
      const bgMap: {[key: string]: string} = {
        view2: "banner3",
        view3: "banner4", 
        view4: "banner5"
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
      return dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? dateStr : '';
    };

    if (!this.form) return;

    // Poblar campos de forma más eficiente
    Object.keys(this.formElements).forEach(field => {
      const element = this.formElements[field];
      if (element && this.formVariables[field] !== undefined) {
        const value = this.formVariables[field];
        
        if (field.includes('fecha')) {
          element.value = formatDateForInput(value);
        } else if (typeof value === 'number' && ['ventaNeta', 'salarioPromedio', 'precioVacunacion'].includes(field)) {
          element.value = formatWithThousands(value);
        } else {
          element.value = value.toString();
        }
      }
    });

    // Disparar evento change para calculoProductividad
    const calcElement = this.formElements.calculoProductividad;
    if (calcElement) {
      calcElement.dispatchEvent(new Event('change'));
    }

    this.updateProductivityDisplay();
  }

  private resetFormToDefaults(): void {
    this.formVariables = { ...this.defaultFormVariables };
    localStorage.removeItem('influvac-form-data');
    this.populateFormFromVariables();
  }

  private updateProductivityDisplay(): void {
    if (this.productivityDisplay) {
      this.productivityDisplay.textContent = this.formVariables.indicadorProductividad.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  private switchView(viewId: string, bgImage?: string | null): void {
    if (this.currentView === "view4") {
      this.cleanupCharts();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

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

  private extractFormValues(): void {
    if (this.formVariables.calculoProductividad === "productividad_individual") {
      this.formVariables.indicadorProductividad = this.formVariables.ventaNeta;
    } else {
      this.formVariables.indicadorProductividad = this.formVariables.numEmpleados > 0 
        ? (this.formVariables.ventaNeta / this.formVariables.numEmpleados) / 12
        : 0;
    }
  }

  private calculateResults(): void {
    const totalVacunados = this.formVariables.numeroDeVacunados1 + this.formVariables.numeroDeVacunados2;
    const porcentajeVacunacion = (totalVacunados / this.formVariables.numEmpleados) * 100;
    const costoTotalVacunacion = totalVacunados * this.formVariables.precioVacunacion;
    
    console.log('Cálculos realizados:', {
      totalVacunados: totalVacunados.toLocaleString('es-CO'),
      porcentajeVacunacion: porcentajeVacunacion.toFixed(2) + '%',
      costoTotalVacunacion: '$' + costoTotalVacunacion.toLocaleString('es-CO')
    });

    // Actualizar resultados en el DOM
    setTimeout(() => this.updateResultsInDOM(costoTotalVacunacion, totalVacunados), 500);
  }

  private updateResultsInDOM(costoTotalVacunacion: number, totalVacunados: number): void {
    const updates = [
      { id: "resultado-ahorro-total", value: `$${(costoTotalVacunacion * 2.5).toLocaleString('es-CO')}` },
      { id: "resultado-roi", value: "320%" },
      { id: "resultado-costo-beneficio", value: "3.2:1" },
      { id: "resultado-costo-caso-evitado", value: `$${(costoTotalVacunacion / Math.max(totalVacunados * 0.1, 1)).toLocaleString('es-CO')}` },
      { id: "resultado-efectividad", value: "85%" }
    ];

    updates.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    this.updateCasesResults(totalVacunados);
  }

  private updateCasesResults(totalVacunados: number): void {
    const factorExposicion = this.formVariables.nivelExposicion;
    const baseCase = Math.round((this.formVariables.numEmpleados - totalVacunados) * 0.01 * factorExposicion);
    
    const cases = [
      { id: "casos-h1n1", factor: 1.2 },
      { id: "casos-h3n2", factor: 1.0 },
      { id: "casos-b-victoria", factor: 0.8 },
      { id: "casos-b-yamagata", factor: 0.9 }
    ];

    cases.forEach(({ id, factor }) => {
      const element = document.getElementById(id);
      if (element) element.textContent = Math.round(baseCase * factor).toString();
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
    [this.chartNoVacunar, this.chartVacunacionTetravalente].forEach(chart => {
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
      activos: days.map(day => Math.max(0, Math.sin(day * 0.02) * 15 + Math.random() * 5) * multiplier),
      ah1n1: days.map(day => Math.max(0, Math.sin(day * 0.015) * 12 + Math.random() * 3) * multiplier),
      ah3n2: days.map(day => Math.max(0, Math.sin(day * 0.025) * 10 + Math.random() * 4) * multiplier),
      victoria: days.map(day => Math.max(0, Math.sin(day * 0.018) * 8 + Math.random() * 2) * multiplier),
      yamagata: days.map(day => Math.max(0, Math.sin(day * 0.022) * 6 + Math.random() * 3) * multiplier)
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
            { label: "Activos", data: data.activos, borderColor: "#FF6B6B", backgroundColor: "#FF6B6B20", tension: 0.3, fill: true },
            { label: "AH1N1", data: data.ah1n1, borderColor: "#4ECDC4", backgroundColor: "#4ECDC420", tension: 0.3, fill: true },
            { label: "AH3N2", data: data.ah3n2, borderColor: "#45B7D1", backgroundColor: "#45B7D120", tension: 0.3, fill: true },
            { label: "Victoria", data: data.victoria, borderColor: "#F7DC6F", backgroundColor: "#F7DC6F20", tension: 0.3, fill: true },
            { label: "Yamagata", data: data.yamagata, borderColor: "#BB8FCE", backgroundColor: "#BB8FCE20", tension: 0.3, fill: true }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom" as const,
              labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
            }
          },
          scales: {
            x: { title: { display: true, text: "Días del año", font: { size: 12, weight: "bold" } }, ticks: { maxTicksLimit: 12 } },
            y: { title: { display: true, text: "Número de casos", font: { size: 12, weight: "bold" } }, beginAtZero: true }
          }
        }
      });
    };

    this.chartNoVacunar = createChart("chart-no-vacunar", noVacunarData);
    this.chartVacunacionTetravalente = createChart("chart-vacunacion-tetravalente", vacunacionData);
  }

  private updateLogo(currentView: string): void {
    const logo = document.getElementById("dynamic-logo") as HTMLImageElement;
    if (!logo) return;

    const whiteLogo = logo.getAttribute("data-white-logo");
    const colorLogo = logo.getAttribute("data-color-logo");

    if (!whiteLogo || !colorLogo) return;

    logo.src = (currentView === "view1" || currentView === "view4") ? whiteLogo : colorLogo;
  }
}
