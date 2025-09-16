import { CardHeader, CardImg } from 'reactstrap';
import {
  companyAdresse,
  companyLogo,
  companyName,
  companyServices1,
  companyServices2,
  companyTel,
  outil_10,
  outil_11,
  outil_12,
  outil_13,
  outil_4,
  outil_5,
  outil_6,
  outil_7,
  outil_8,
  outil_9,
} from '../../CompanyInfo/CompanyInfo';
export default function FactureHeader() {
  return (
    <CardHeader
      style={{
        border: '2px solid rgba(100, 169, 238, 0.5)',
        borderRadius: '5px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '-5px',
        }}
        className='d-flex flex-column gap-3 justify-content-center align-item-center'
      >
        <CardImg
          src={companyLogo}
          style={{
            width: '160px',
          }}
        />
      </div>
      <h3 className='text-center text-bold font-size-22 text-info '>
        {' '}
        {companyName}{' '}
      </h3>
      <h6
        style={{
          width: '50%',
        }}
        className='text-center text-light bg-info font-size-11  px-2 py-1 rounded-3 mx-auto mb-2'
      >
        {' '}
        Commerce Général & Immobilier
      </h6>
      <div className='text-info font-size-11 d-flex flex-column gap-0 justify-content-center align-item-center text-center mb-2'>
        <strong>{companyServices1}</strong>
        <strong>{companyServices2}</strong>
        <strong>{companyAdresse}</strong>

        <strong className='font-size-12'>Info: {companyTel}</strong>
      </div>
      <div className='d-flex gap-3  justify-content-center align-item-center'>
        <CardImg src={outil_5} style={{ width: '50px' }} />
        <CardImg src={outil_8} style={{ width: '50px' }} />
        <CardImg src={outil_10} style={{ width: '50px' }} />
        <CardImg src={outil_6} style={{ width: '50px' }} />
        <CardImg src={outil_11} style={{ width: '50px' }} />
        <CardImg src={outil_12} style={{ width: '50px' }} />
        <CardImg src={outil_13} style={{ width: '50px' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
        }}
        className='d-flex gap-1 flex-column justify-content-center align-item-center'
      >
        <CardImg src={outil_4} style={{ width: '50px' }} />
        <CardImg src={outil_7} style={{ width: '50px' }} />
        <CardImg src={outil_9} style={{ width: '50px' }} />
      </div>
    </CardHeader>
  );
}
