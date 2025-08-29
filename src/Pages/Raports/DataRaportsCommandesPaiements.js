import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import { useAllCommandes } from '../../Api/queriesCommande';
import { useAllPaiements } from '../../Api/queriesPaiement';

Chart.register(CategoryScale);

const BarChartCommandePaiement = () => {
  const { data: commandes = [] } = useAllCommandes();
  const { data: paiements = [] } = useAllPaiements();

  const countCommandeByMonth = (item) => {
    const monthlyCounts = new Array(12).fill(0);
    item.forEach((comm) => {
      const date = new Date(comm.createdAt);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlyCounts[month]++;
      }
    });
    return monthlyCounts;
  };

  const sumTotalAmountToPayeByMonth = (items) => {
    const monthlySums = new Array(12).fill(0);
    items.forEach((item) => {
      const date = new Date(item.createdAt);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlySums[month] += Number(item.totalAmount || 0);
      }
    });
    return monthlySums;
  };
  const sumTotalAmountPayeByMonth = (items) => {
    const monthlySums = new Array(12).fill(0);
    items.forEach((item) => {
      const date = new Date(item.createdAt);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlySums[month] += Number(item.totalPaye || 0);
      }
    });
    return monthlySums;
  };
  const sumTotalAmountNotPayeByMonth = (items) => {
    const monthlySums = new Array(12).fill(0);
    items.forEach((item) => {
      const date = new Date(item.createdAt);
      if (!isNaN(date)) {
        const month = date.getMonth();
        monthlySums[month] += Number(item.totalAmount - item.totalPaye || 0);
      }
    });
    return monthlySums;
  };

  // const sumTotalTraitement = () => {
  //   return commandes.reduce((acc, traitement) => {
  //     acc += Number(traitement.totalAmount || 0);
  //     return acc;
  //   }, 0);
  // };

  // const sumTotalOrdonnance = () => {
  //   return ordonnanceData.reduce((acc, ordonnance) => {
  //     acc += Number(ordonnance.totalAmount || 0);
  //     return acc;
  //   }, 0);
  // };

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
        data: countCommandeByMonth(commandes?.commandesListe),
        backgroundColor: ' #5F8B4C',
        barThickness: 10,
      },
      {
        label: `Somme à Payé  `,
        data: sumTotalAmountToPayeByMonth(paiements),
        backgroundColor: ' #FFD63A',
        barThickness: 10,
      },

      {
        label: `Somme Payé`,
        data: sumTotalAmountPayeByMonth(paiements),
        backgroundColor: ' #4cd13a',
        barThickness: 10,
      },
      {
        label: `Somme Impayé`,
        data: sumTotalAmountNotPayeByMonth(paiements),
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
        text: 'Statistiques des Patients, Traitements et Ordonnances',
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
