import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  Title,
} from 'chart.js';

// Registrar los componentes necesarios (manual tree-shaking)
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  Title
);

const Grafic = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destruye instancia previa si existe (hot reload / navegación)
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [
          {
            label: 'Ventas 2024',
            data: [10, 20, 15, 25, 30],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.15)',
            tension: 0.1,
            fill: true,
          },
          {
            label: 'Ventas 2025',
            data: [5, 15, 10, 20, 25],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.15)',
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Comparación de Ventas 2024 vs 2025',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Cleanup
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 800, height: 400, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Gráfico de Influenza</h1>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Grafic;
