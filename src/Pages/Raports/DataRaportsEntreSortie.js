import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';

Chart.register(CategoryScale);

const BarChartEntreSortie = () => {
  const { data: paiementsData = [] } = useAllPaiements();
  const { data: depenseData = [] } = useAllDepenses();

  const sumPaiementTotalAmoutByMonth = (paiement) => {
    const monthlySums = new Array(12).fill(0);
    paiement.forEach((paie) => {
      const date = new Date(paie.paiementDate);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlySums[month] += Number(paie.totalPaye || 0);
      }
    });
    return monthlySums;
  };

  const sumTotalAmountByMonth = (items) => {
    const monthlySums = new Array(12).fill(0);
    items.forEach((item) => {
      const date = new Date(item.dateOfDepense);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlySums[month] += Number(item.totalAmount || 0);
      }
    });
    return monthlySums;
  };

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
        data: sumPaiementTotalAmoutByMonth(paiementsData),
        backgroundColor: ' #328E6E',
        barThickness: 10,
      },

      {
        label: 'Sortie (Dépenses)',
        data: sumTotalAmountByMonth(depenseData),
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
