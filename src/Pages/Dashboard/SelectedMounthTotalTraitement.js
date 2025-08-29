// import React, { useState, useMemo } from 'react';
// import { Card, CardBody } from 'reactstrap';
// import { useAllTraitement } from '../../Api/queriesTraitement';

// const SelectedMounthTotalTraitement = () => {
//   const { data: traitementsData = [] } = useAllTraitement();

//   const monthOptions = [
//     'Janvier',
//     'Février',
//     'Mars',
//     'Avril',
//     'Mai',
//     'Juin',
//     'Juillet',
//     'Août',
//     'Septembre',
//     'Octobre',
//     'Novembre',
//     'Décembre',
//   ];

//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

//   const totalTraitements = useMemo(() => {
//     return traitementsData.filter((item) => {
//       const date = new Date(item.createdAt);
//       return !isNaN(date) && date.getMonth() === selectedMonth;
//     }).length;
//   }, [traitementsData, selectedMonth]);

//   return (
//     <React.Fragment>
//       <Card
//         style={{
//           background: 'linear-gradient(to top right , #090979, #00D4FF)',
//         }}
//       >
//         <CardBody>
//           <div className='d-flex align-items-center justify-content-between mb-3'>
//             <h6 className='text-white text-center'>Traitements par mois</h6>
//             <select
//               className='form-select form-select-sm'
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//             >
//               {monthOptions.map((label, index) => (
//                 <option key={index} value={index}>
//                   {label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className='text-center'>
//             <h1 className='display-4 text-warning'>{totalTraitements}</h1>
//             <p className='text-white'>
//               Traitements en:{' '}
//               <span className='text-uppercase fs-5'>
//                 {monthOptions[selectedMonth]}
//               </span>
//             </p>
//           </div>
//         </CardBody>
//       </Card>
//     </React.Fragment>
//   );
// };

// export default SelectedMounthTotalTraitement;
