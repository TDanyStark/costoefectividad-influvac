// Servicio para gestión de gráficas

import type { InfluenzaResults } from '../types/FormTypes';

export class ChartService {
  private chartNoVacunar: any = null;
  private chartVacunacionTetravalente: any = null;

  constructor() {
    // Escuchar cambios de vista
    document.addEventListener('viewChanged', (e: any) => {
      const { newView, oldView } = e.detail;
      if (oldView === "view4") {
        this.cleanupCharts();
      }
      if (newView === "view4") {
        this.loadChartsView4();
      }
    });
  }

  /**
   * Carga las gráficas de la vista 4
   */
  private loadChartsView4(): void {
    const checkChart = () => {
      if (typeof (window as any).Chart !== "undefined") {
        // Las gráficas se crearán cuando se proporcionen los datos
      } else {
        setTimeout(checkChart, 100);
      }
    };
    checkChart();
  }

  /**
   * Limpia las gráficas existentes
   */
  private cleanupCharts(): void {
    [this.chartNoVacunar, this.chartVacunacionTetravalente].forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
    this.chartNoVacunar = null;
    this.chartVacunacionTetravalente = null;
  }

  /**
   * Crea las gráficas de influenza con datos reales
   */
  createInfluenzaCharts(calculatedResults: InfluenzaResults): void {
    this.cleanupCharts();

    if (!calculatedResults) {
      console.warn('No hay datos calculados disponibles para las gráficas');
      return;
    }

    const diasEnAnio = calculatedResults.diasEnAnio || 365;
    const days = Array.from({ length: diasEnAnio }, (_, i) => i + 1);

    console.log('Creando gráficas con datos reales:', {
      diasEnAnio,
      totalInfectivosNoVacunados: calculatedResults.infectivosTotalesNoVacunados?.length,
      totalInfectivosVacunados: calculatedResults.infectivosTotalesVacunados?.length,
      maxInfectivosNoVacunados: Math.max(...(calculatedResults.infectivosTotalesNoVacunados || [0])),
      maxInfectivosVacunados: Math.max(...(calculatedResults.infectivosTotalesVacunados || [0]))
    });

    // Datos para población no vacunada
    const noVacunarData = {
      activos: calculatedResults.infectivosTotalesNoVacunados || Array(diasEnAnio).fill(0),
      ah1n1: calculatedResults.infectivosAH1N1NoVacunados || Array(diasEnAnio).fill(0),
      ah3n2: calculatedResults.infectivosAH3N2NoVacunados || Array(diasEnAnio).fill(0),
      victoria: calculatedResults.infectivosBVictoriaNoVacunados || Array(diasEnAnio).fill(0),
      yamagata: calculatedResults.infectivosBYamagataNoVacunados || Array(diasEnAnio).fill(0),
      noVacunal: calculatedResults.infectivosNoVacunal || Array(diasEnAnio).fill(0),
    };

    // Datos para población vacunada
    const vacunacionData = {
      activos: calculatedResults.infectivosTotalesVacunados || Array(diasEnAnio).fill(0),
      ah1n1: calculatedResults.infectivosAH1N1Vacunados || Array(diasEnAnio).fill(0),
      ah3n2: calculatedResults.infectivosAH3N2Vacunados || Array(diasEnAnio).fill(0),
      victoria: calculatedResults.infectivosBVictoriaVacunados || Array(diasEnAnio).fill(0),
      yamagata: calculatedResults.infectivosBYamagataVacunados || Array(diasEnAnio).fill(0),
      noVacunal: calculatedResults.infectivosNoVacunal || Array(diasEnAnio).fill(0),
    };

    this.chartNoVacunar = this.createChart("chart-no-vacunar", noVacunarData, days, diasEnAnio);
    this.chartVacunacionTetravalente = this.createChart(
      "chart-vacunacion-tetravalente",
      vacunacionData,
      days,
      diasEnAnio
    );
  }

  /**
   * Crea una gráfica individual
   */
  private createChart(canvasId: string, data: any, days: number[], diasEnAnio: number): any {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return null;

    return new (window as any).Chart(ctx, {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Total Infectivos",
            data: data.activos,
            borderColor: "#FF6B6B",
            backgroundColor: "#FF6B6B20",
            tension: 0.3,
            fill: true,
            borderWidth: 1,
          },
          {
            label: "A H1N1",
            data: data.ah1n1,
            borderColor: "#4ECDC4",
            backgroundColor: "#4ECDC420",
            tension: 0.3,
            fill: false,
            borderWidth: 1,
          },
          {
            label: "A H3N2",
            data: data.ah3n2,
            borderColor: "#45B7D1",
            backgroundColor: "#45B7D120",
            tension: 0.3,
            fill: false,
            borderWidth: 1,
          },
          {
            label: "B Victoria",
            data: data.victoria,
            borderColor: "#F7DC6F",
            backgroundColor: "#F7DC6F20",
            tension: 0.3,
            fill: false,
            borderWidth: 1,
          },
          {
            label: "B Yamagata",
            data: data.yamagata,
            borderColor: "#BB8FCE",
            backgroundColor: "#BB8FCE20",
            tension: 0.3,
            fill: false,
            borderWidth: 1,
          },
          {
            label: "No Vacunal",
            data: data.noVacunal,
            borderColor: "#95A5A6",
            backgroundColor: "#95A5A620",
            tension: 0.3,
            fill: false,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom" as const,
            labels: { 
              usePointStyle: true, 
              padding: 15, 
              font: { size: 11 }
            },
          },
          title: {
            display: true,
            text: canvasId.includes('no-vacunar') ? 'Evolución de Infectivos - Sin Vacunación' : 'Evolución de Infectivos - Con Vacunación Tetravalente',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Días del año",
              font: { size: 12, weight: "bold" },
            },
            ticks: { 
              maxTicksLimit: 12,
              autoSkip: true,
              callback: function(value: any, index: number, ticks: any[]) {
                const dayNumber = parseInt(value);
                
                const interval = Math.ceil(diasEnAnio / 12);
                
                if (dayNumber % interval === 0 || dayNumber === 1 || dayNumber === diasEnAnio) {
                  return dayNumber.toString();
                }
                
                return '';
              },
              maxRotation: 45,
              minRotation: 0
            },
          },
          y: {
            title: {
              display: true,
              text: "Número de infectivos",
              font: { size: 12, weight: "bold" },
            },
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return Math.round(value).toLocaleString('es-CO');
              }
            }
          },
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 5
          }
        }
      },
    });
  }

  /**
   * Verifica si las gráficas están inicializadas
   */
  areChartsInitialized(): boolean {
    return !!(this.chartNoVacunar && this.chartVacunacionTetravalente);
  }

  /**
   * Destruye todas las gráficas
   */
  destroy(): void {
    this.cleanupCharts();
  }
}
