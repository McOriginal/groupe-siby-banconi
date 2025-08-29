import { Modal } from 'reactstrap';

const FormModal = ({
  form_modal,
  tog_form_modal,
  setForm_modal,
  modal_title,
  bodyContent,
  size,
}) => {
  return (
    <Modal
      isOpen={form_modal}
      toggle={() => {
        tog_form_modal();
      }}
      size={size}
      scrollable={true}
      centered={true}
      backdrop='static'
    >
      <div className='modal-header'>
        <h5 className='modal-title mt-0'>{modal_title}</h5>
        <button
          type='button'
          onClick={() => setForm_modal(false)}
          className='close'
          data-dismiss='modal'
          aria-label='Close'
        >
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div className='modal-body'>{bodyContent}</div>
    </Modal>
  );
};

export default FormModal;
