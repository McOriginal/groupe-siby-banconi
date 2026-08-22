import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import { useAllCommandes } from '../../Api/queriesCommande';
import { useAllPaiements } from '../../Api/queriesPaiement';

Chart.register(CategoryScale);

const BarChartCommandePaiement = () => {
  /**
   * OPTIMISATION PRO (Charts)
   *
   * Avant:
   * - Chargement de toutes les commandes + paiements
   * - Agrégation par mois côté navigateur
   *
   * Maintenant:
   * - On demande directement des stats mensuelles au backend:
   *   - `/commandes/getAllCommandes?stats=month`
   *   - `/paiements/getAllPaiements?stats=month`
   */
  const { data: commandesStats } = useAllCommandes({
    stats: 'month',
    year: new Date().getFullYear(),
  });
  const { data: paiementsStats } = useAllPaiements({
    stats: 'month',
    year: new Date().getFullYear(),
  });

  // Données normalisées (12 mois)
  const commandesByMonth = commandesStats?.countCommandes || new Array(12).fill(0);
  const sumTotalAmountToPayeByMonth =
    paiementsStats?.sumTotalAmount || new Array(12).fill(0);
  const sumTotalAmountPayeByMonth =
    paiementsStats?.sumTotalPaye || new Array(12).fill(0);
  const sumTotalAmountNotPayeByMonth =
    paiementsStats?.sumTotalImpayes || new Array(12).fill(0);

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
        label: 'Nombre de Commandes',
        data: commandesByMonth,
        backgroundColor: ' #5F8B4C',
        barThickness: 10,
      },
      {
        label: `Somme à Payé  `,
        data: sumTotalAmountToPayeByMonth,
        backgroundColor: ' #FFD63A',
        barThickness: 10,
      },

      {
        label: `Somme Payé`,
        data: sumTotalAmountPayeByMonth,
        backgroundColor: ' #4cd13a',
        barThickness: 10,
      },
      {
        label: `Somme Impayé`,
        data: sumTotalAmountNotPayeByMonth,
        backgroundColor: ' #d13a3a',
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
        text: 'Statistiques de vente ',
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

export default BarChartCommandePaiement;
