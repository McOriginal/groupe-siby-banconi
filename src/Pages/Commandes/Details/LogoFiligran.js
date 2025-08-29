import { companyLogo, companyName } from '../../CompanyInfo/CompanyInfo';

export default function LogoFiligran() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '200px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: 0.1,
        zIndex: 0,
      }}
    >
      <img src={companyLogo} alt={companyName} />
    </div>
  );
}
