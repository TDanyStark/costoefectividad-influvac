// Servicio para manejo del formulario

import type { FormVariables, FormElements } from '../types/FormTypes';
import { FORM_FIELDS, NUMERIC_FIELDS, TEXT_FIELDS, DEFAULT_FORM_VARIABLES } from '../constants';
import { DataFormatter } from '../formatters/DataFormatter';
import { FormValidator } from '../validators/FormValidator';
import { StorageService } from './StorageService';
import { InfluenzaCalculationService } from './InfluenzaCalculationService';

export class FormService {
  private form: HTMLFormElement | null = null;
  private formElements: FormElements = {};
  private productivityDisplay: HTMLElement | null = null;
  private formVariables: FormVariables = { ...DEFAULT_FORM_VARIABLES };
  
  private onFormChangeCallback?: () => void;

  constructor(onFormChange?: () => void) {
    this.onFormChangeCallback = onFormChange;
    this.initializeFormElements();
    this.initializeFormVariables();
    this.populateFormFromVariables();
    this.initializeFormHandler();
  }

  /**
   * Inicializa los elementos del formulario
   */
  private initializeFormElements(): void {
    this.form = document.getElementById("modelParametersForm") as HTMLFormElement;

    if (this.form) {
      FORM_FIELDS.forEach((field) => {
        this.formElements[field] = this.form!.querySelector(`[name="${field}"]`);
      });

      this.productivityDisplay = document.querySelector("#indicadorProductividad div.px-2");
    }
  }

  /**
   * Inicializa las variables del formulario desde localStorage o valores por defecto
   */
  private initializeFormVariables(): void {
    const savedFormData = StorageService.loadFormData();

    if (savedFormData && FormValidator.isValidFormData(savedFormData)) {
      this.formVariables = savedFormData;
    } else {
      this.formVariables = { ...DEFAULT_FORM_VARIABLES };
    }
  }

  /**
   * Inicializa los event handlers del formulario
   */
  private initializeFormHandler(): void {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Submit");
        this.handleFormSubmit();
      });
      this.initializeProductivityUpdaters();
    }
  }

  /**
   * Inicializa los actualizadores de productividad
   */
  private initializeProductivityUpdaters(): void {
    const updateProductivity = () => {
      this.formVariables.indicadorProductividad = InfluenzaCalculationService.calculateProductivity(
        this.formVariables.calculoProductividad,
        this.formVariables.ventaNeta,
        this.formVariables.numEmpleados
      );
      this.updateProductivityDisplay();
    };

    // Configurar listeners para campos numéricos
    NUMERIC_FIELDS.forEach((field) => {
      const element = this.formElements[field] as HTMLInputElement;
      if (element) {
        const updateField = () => {
          (this.formVariables as any)[field] = DataFormatter.cleanNumericValue(element.value);
          if (["numEmpleados", "ventaNeta", "calculoProductividad"].includes(field)) {
            updateProductivity();
          }
          StorageService.saveFormData(this.formVariables);
          this.onFormChangeCallback?.();
        };

        element.addEventListener("input", updateField);
        element.addEventListener("change", updateField);
      }
    });

    // Listeners para campos de texto y selects
    TEXT_FIELDS.forEach((field) => {
      const element = this.formElements[field];
      if (element) {
        element.addEventListener("change", () => {
          (this.formVariables as any)[field] = element.value;
          if (field === "calculoProductividad") updateProductivity();
          StorageService.saveFormData(this.formVariables);
          this.onFormChangeCallback?.();
        });
      }
    });

    updateProductivity();
  }

  /**
   * Puebla el formulario con los valores de las variables
   */
  private populateFormFromVariables(): void {
    if (!this.form) return;

    Object.keys(this.formElements).forEach((field) => {
      const element = this.formElements[field];

      if (element && this.formVariables[field as keyof FormVariables] !== undefined) {
        const value = this.formVariables[field as keyof FormVariables];
        if (field.includes("fecha")) {
          element.value = DataFormatter.formatDateForInput(value as string);
        } else if (
          typeof value === "number" &&
          ["ventaNeta", "salarioPromedio", "precioVacunacion"].includes(field)
        ) {
          element.value = DataFormatter.formatWithThousands(value);
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

  /**
   * Actualiza el display de productividad
   */
  private updateProductivityDisplay(): void {
    if (this.productivityDisplay) {
      this.productivityDisplay.textContent = 
        DataFormatter.formatProductivityIndicator(this.formVariables.indicadorProductividad);
    }
  }

  /**
   * Maneja el envío del formulario
   */
  private handleFormSubmit(): void {
    this.extractFormValues();
    this.onFormChangeCallback?.();
  }

  /**
   * Extrae los valores del formulario
   */
  private extractFormValues(): void {
    this.formVariables.indicadorProductividad = InfluenzaCalculationService.calculateProductivity(
      this.formVariables.calculoProductividad,
      this.formVariables.ventaNeta,
      this.formVariables.numEmpleados
    );
  }

  /**
   * Resetea el formulario a valores por defecto
   */
  resetFormToDefaults(): void {
    this.formVariables = { ...DEFAULT_FORM_VARIABLES };
    StorageService.clearFormData();
    this.populateFormFromVariables();
    this.onFormChangeCallback?.();
  }

  /**
   * Obtiene las variables del formulario
   */
  getFormVariables(): FormVariables {
    return { ...this.formVariables };
  }

  /**
   * Valida las variables del formulario
   */
  validateForm(): { isValid: boolean; errors: string[] } {
    return FormValidator.validateFormVariables(this.formVariables);
  }

  /**
   * Verifica si el formulario tiene datos suficientes para calcular
   */
  hasMinimumDataForCalculation(): boolean {
    return !!(
      this.formVariables.numEmpleados &&
      this.formVariables.fecha1Vacunacion &&
      this.formVariables.numeroDeVacunados1 >= 0
    );
  }
}
