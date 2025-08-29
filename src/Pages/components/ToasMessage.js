import { useState } from 'react';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';

export default function ToasMessage() {
  const [toast_success, set_success_toast] = useState(false);

  const toggleToast = () => {
    set_success_toast(!toast_success);
    setTimeout(() => {
      set_success_toast(false);
    }, 2000);
  };
  return (
    <div className='position-fixed bottom-0 end-0 p-3' style={{ zIndex: '11' }}>
      <Toast isOpen={toast_success}>
        <ToastHeader toggle={toggleToast}>
          {/* <img src={logo} alt='' className='me-2' height='18' /> */}
          School Management
        </ToastHeader>
        <ToastBody color='primary'>
          Hello, world! This is a toast message.
        </ToastBody>
      </Toast>
    </div>
  );
}
