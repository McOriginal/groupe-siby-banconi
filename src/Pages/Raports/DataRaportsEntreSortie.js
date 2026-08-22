import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';

Chart.register(CategoryScale);

const BarChartEntreSortie = () => {
  /**
   * OPTIMISATION PRO (Charts entrées/sorties)
   *
   * Avant:
   * - Chargement complet paiements + dépenses
   *
   * Maintenant:
   * - Stats mensuelles côté serveur:
   *   - `/paiements/getAllPaiements?stats=month`
   *   - `/depenses/getAllDepense?stats=month`
   */
  const { data: paiementsStats } = useAllPaiements({
    stats: 'month',
    year: new Date().getFullYear(),
  });
  const { data: depensesStats } = useAllDepenses({
    stats: 'month',
    year: new Date().getFullYear(),
  });

  const sumPaiementTotalAmoutByMonth =
    paiementsStats?.sumTotalPaye || new Array(12).fill(0);
  const sumTotalAmountByMonth =
    depensesStats?.sumTotalDepenses || new Array(12).fill(0);

  const labels = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Jui',
    'Juil',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Entrée (Paiements)',
        data: sumPaiementTotalAmoutByMonth,
        backgroundColor: ' #328E6E',
        barThickness: 10,
      },

      {
        label: 'Sortie (Dépenses)',
        data: sumTotalAmountByMonth,
        backgroundColor: ' #CF0F47',
        barThickness: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#102E50',
          boxWidth: 20,
          boxHeight: 20,
        },
      },
      title: {
        display: true,
        text: 'Statistiques des Entrée, Sortie',
        color: '#102E50',
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    animationSteps: 60,
    animationEasing: 'easeInOutQuart',
    responsiveAnimationDuration: 500,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: true,
        },
        ticks: {
          color: ' #102E50',
        },
      },
      y: {
        grid: {
          drawBorder: false,
        },
        ticks: {
          color: ' #3A59D1',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <React.Fragment>
      <Bar width={537} height={268} data={data} options={options} />
    </React.Fragment>
  );
};

export default BarChartEntreSortie;
