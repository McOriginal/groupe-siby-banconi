import { useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Button color='warning' className='my-2' onClick={() => navigate(-1)}>
      <i className='bx bx-arrow-back me-1' />
      Retour
    </Button>
  );
}
