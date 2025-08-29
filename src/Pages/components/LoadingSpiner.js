import { Spinner } from 'reactstrap';

export default function LoadingSpiner() {
  return (
    <Spinner
      color='primary'
      style={{
        height: '3rem',
        width: '3rem',
        margin: '0px auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      Loading...
    </Spinner>
  );
}
