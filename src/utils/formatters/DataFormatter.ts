// Utilidades para formateo de datos

export class DataFormatter {
  
  /**
   * Limpia y convierte un valor string a número, removiendo puntos
   */
  static cleanNumericValue(value: string): number {
    return parseInt(value.replace(/\./g, "")) || 0;
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatWithThousands(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /**
   * Formatea una fecha para input de tipo date
   */
  static formatDateForInput(dateStr: string): string {
    return dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? dateStr : "";
  }

  /**
   * Formatea cantidad como moneda colombiana
   */
  static formatCurrency(amount: number): string {
    return `$ ${Math.round(amount).toLocaleString("es-CO")}`;
  }

  /**
   * Formatea cantidad como moneda colombiana con decimales
   */
  static formatCurrencyWithDecimals(amount: number): string {
    return `$ ${amount.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Formatea un porcentaje
   */
  static formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
  }

  /**
   * Formatea números con decimales para display
   */
  static formatNumberWithDecimals(value: number): string {
    return value.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Formatea número con separadores de miles sin decimales
   */
  static formatNumber(value: number): string {
    return Math.round(value).toLocaleString("es-CO");
  }

  /**
   * Formatea el indicador de productividad para display
   */
  static formatProductivityIndicator(value: number): string {
    return value.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
