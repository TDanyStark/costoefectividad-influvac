// Servicio para la persistencia de datos en localStorage

import type { FormVariables, ResumenData } from '../types/FormTypes';
import { STORAGE_KEYS } from '../constants';

export class StorageService {
  
  /**
   * Carga los datos del formulario desde localStorage
   */
  static loadFormData(): FormVariables | null {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
      return null;
    }
  }

  /**
   * Guarda los datos del formulario en localStorage
   */
  static saveFormData(formVariables: FormVariables): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.FORM_DATA,
        JSON.stringify(formVariables)
      );
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }

  /**
   * Guarda los datos del resumen en localStorage
   */
  static saveResumenData(resumenData: ResumenData): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.RESUMEN_DATA,
        JSON.stringify(resumenData)
      );
      console.log('Datos guardados para resumen:', resumenData);
    } catch (error) {
      console.error('Error al guardar datos de resumen en localStorage:', error);
    }
  }

  /**
   * Carga los datos del resumen desde localStorage
   */
  static loadResumenData(): ResumenData | null {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.RESUMEN_DATA);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Error al cargar datos de resumen desde localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.RESUMEN_DATA);
      return null;
    }
  }

  /**
   * Elimina los datos del formulario del localStorage
   */
  static clearFormData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
    }
  }

  /**
   * Elimina todos los datos relacionados con la aplicación
   */
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key: string) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error al limpiar todos los datos:", error);
    }
  }
}
