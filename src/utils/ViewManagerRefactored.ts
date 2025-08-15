// ViewManager refactorizado con separación de responsabilidades

import type { FormVariables, InfluenzaResults } from './types/FormTypes';
import { FormService } from './services/FormService';
import { ViewService } from './services/ViewService';
import { ChartService } from './services/ChartService';
import { DOMUpdateService } from './services/DOMUpdateService';
import { InfluenzaCalculationService } from './services/InfluenzaCalculationService';
import { StorageService } from './services/StorageService';

/**
 * ViewManager principal que orquesta todos los servicios
 * Siguiendo el patrón de separación de responsabilidades
 */
export class ViewManager {
  private formService: FormService;
  private viewService: ViewService;
  private chartService: ChartService;
  
  // Cache de resultados calculados
  private calculatedResults: InfluenzaResults | null = null;

  constructor() {
    // Inicializar servicios
    this.formService = new FormService(this.handleFormChange.bind(this));
    this.viewService = new ViewService();
    this.chartService = new ChartService();
    // Configurar eventos personalizados
    this.initializeCustomEvents();
    
    // Calcular resultados iniciales
    this.recalculateResults();
  }

  /**
   * Inicializa eventos personalizados de la aplicación
   */
  private initializeCustomEvents(): void {
    // Evento para resetear formulario
    document.addEventListener("formReset", () => {
      setTimeout(() => this.resetFormToDefaults(), 100);
    });

    // Evento para cambio de vista
    document.addEventListener('viewChanged', (e: any) => {
      const { newView } = e.detail;
      this.handleViewChange(newView);
    });
  }

  /**
   * Maneja los cambios en el formulario
   */
  private handleFormChange(): void {
    this.recalculateResults();
  }

  /**
   * Maneja los cambios de vista
   */
  private handleViewChange(viewId: string): void {
    if (viewId === "view4" && this.calculatedResults) {
      // Crear gráficas cuando se cambie a la vista 4
      setTimeout(() => {
        this.chartService.createInfluenzaCharts(this.calculatedResults!);
      }, 100);
    }
  }

  /**
   * Recalcula los resultados cuando cambian los datos del formulario
   */
  private recalculateResults(): void {
    if (!this.formService.hasMinimumDataForCalculation()) {
      return;
    }

    try {
      const formVariables = this.formService.getFormVariables();
      
      // Validar datos del formulario
      const validation = this.formService.validateForm();
      if (!validation.isValid) {
        console.error("Errores de validación:", validation.errors);
        alert(`Error de validación: ${validation.errors.join(', ')}`);
        return;
      }

      // Calcular resultados
      this.calculatedResults = InfluenzaCalculationService.calculateInfluenzaResults(formVariables);

      // Actualizar DOM
      DOMUpdateService.updateAllResults(formVariables, this.calculatedResults);

      // Si estamos en la vista 4, actualizar gráficas
      if (this.viewService.isViewActive("view4")) {
        this.chartService.createInfluenzaCharts(this.calculatedResults);
      }

    } catch (error) {
      console.error("Error en los cálculos:", error);
      this.handleCalculationError(error);
    }
  }

  /**
   * Maneja errores en los cálculos
   */
  private handleCalculationError(error: any): void {
    // Mostrar mensaje de error al usuario
    const errorMessage = error.message || "Error en los cálculos";
    console.error("Error detallado:", error);
    
    // Aquí se podría mostrar un toast o modal de error
    // Por ahora solo lo registramos en la consola
  }

  /**
   * Resetea el formulario a valores por defecto
   */
  private resetFormToDefaults(): void {
    this.formService.resetFormToDefaults();
    this.calculatedResults = null;
  }

  /**
   * Obtiene las variables actuales del formulario
   */
  getFormVariables(): FormVariables {
    return this.formService.getFormVariables();
  }

  /**
   * Obtiene los resultados calculados
   */
  getCalculatedResults(): InfluenzaResults | null {
    return this.calculatedResults;
  }

  /**
   * Cambia a una vista específica
   */
  switchToView(viewId: string, bgImage?: string): void {
    this.viewService.switchView(viewId, bgImage);
  }

  /**
   * Obtiene la vista actual
   */
  getCurrentView(): string {
    return this.viewService.getCurrentView();
  }

  /**
   * Verifica si una vista específica está activa
   */
  isViewActive(viewId: string): boolean {
    return this.viewService.isViewActive(viewId);
  }

  /**
   * Limpia todos los datos almacenados
   */
  clearAllData(): void {
    StorageService.clearAllData();
    this.resetFormToDefaults();
  }

  /**
   * Destruye la instancia y limpia recursos
   */
  destroy(): void {
    this.chartService.destroy();
    // Aquí se podrían limpiar otros listeners si fuera necesario
  }
}
