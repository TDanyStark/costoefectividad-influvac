// Validadores para datos del formulario

import type { FormVariables } from '../types/FormTypes';

export class FormValidator {
  
  /**
   * Valida que los datos del formulario tengan todas las propiedades requeridas
   */
  static isValidFormData(data: any): data is FormVariables {
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

  /**
   * Valida que las fechas de vacunación sean válidas
   */
  static validateVaccinationDates(
    firstVaccinationDate: string,
    secondVaccinationDate?: string
  ): { isValid: boolean; error?: string } {
    // Validar primera fecha
    const firstDate = new Date(firstVaccinationDate);
    if (isNaN(firstDate.getTime())) {
      return { isValid: false, error: "❌ La primera fecha no es válida" };
    }

    // Validar segunda fecha solo si existe
    if (secondVaccinationDate) {
      const secondDate = new Date(secondVaccinationDate);

      if (isNaN(secondDate.getTime())) {
        return { isValid: false, error: "❌ La segunda fecha no es válida" };
      }

      if (firstDate.getFullYear() !== secondDate.getFullYear()) {
        return { isValid: false, error: "❌ Las fechas no son del mismo año" };
      }

      if (secondDate <= firstDate) {
        return { isValid: false, error: "❌ La segunda fecha debe ser mayor que la primera" };
      }
    }

    return { isValid: true };
  }

  /**
   * Valida que los números sean positivos
   */
  static validatePositiveNumber(value: number, fieldName: string): { isValid: boolean; error?: string } {
    if (value < 0) {
      return { isValid: false, error: `❌ ${fieldName} debe ser un número positivo` };
    }
    return { isValid: true };
  }

  /**
   * Valida que el número de vacunados no exceda el número de empleados
   */
  static validateVaccinatedCount(
    numeroDeVacunados1: number,
    numeroDeVacunados2: number,
    numEmpleados: number
  ): { isValid: boolean; error?: string } {
    const totalVacunados = numeroDeVacunados1 + numeroDeVacunados2;
    
    if (totalVacunados > numEmpleados) {
      return { 
        isValid: false, 
        error: "❌ El número total de vacunados no puede exceder el número de empleados" 
      };
    }
    
    return { isValid: true };
  }

  /**
   * Valida todos los campos del formulario
   */
  static validateFormVariables(formVariables: FormVariables): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar fechas
    const dateValidation = this.validateVaccinationDates(
      formVariables.fecha1Vacunacion,
      formVariables.fecha2Vacunacion
    );
    if (!dateValidation.isValid && dateValidation.error) {
      errors.push(dateValidation.error);
    }

    // Validar números positivos
    const numericFields = [
      { value: formVariables.numEmpleados, name: "Número de empleados" },
      { value: formVariables.numeroDeVacunados1, name: "Número de vacunados (primera dosis)" },
      { value: formVariables.numeroDeVacunados2, name: "Número de vacunados (segunda dosis)" },
      { value: formVariables.ventaNeta, name: "Venta neta" },
      { value: formVariables.salarioPromedio, name: "Salario promedio" },
      { value: formVariables.precioVacunacion, name: "Precio de vacunación" },
      { value: formVariables.diasIncapacidad, name: "Días de incapacidad" },
    ];

    numericFields.forEach(field => {
      const validation = this.validatePositiveNumber(field.value, field.name);
      if (!validation.isValid && validation.error) {
        errors.push(validation.error);
      }
    });

    // Validar número de vacunados
    const vaccinatedValidation = this.validateVaccinatedCount(
      formVariables.numeroDeVacunados1,
      formVariables.numeroDeVacunados2,
      formVariables.numEmpleados
    );
    if (!vaccinatedValidation.isValid && vaccinatedValidation.error) {
      errors.push(vaccinatedValidation.error);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
