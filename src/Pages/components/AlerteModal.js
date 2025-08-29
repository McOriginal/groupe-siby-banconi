import Swal from 'sweetalert2';

export const successMessageAlert = (message) => {
  Swal.fire({
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
  });
};

export function errorMessageAlert(message) {
  Swal.fire({
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 3000,
  });
}

// ########################################
// src/components/DeleteButton.jsx

export function deleteButton(itemId, itemName, onDelete) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success ms-2',
      cancelButton: 'btn btn-danger me-2',
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: `Êtes-vous sûr de vouloir supprimer ?:`,
      text: itemName,
      icon: 'question',
      iconColor: 'red',
      showCancelButton: true,
      confirmButtonText: 'Oui, Supprimer',
      cancelButtonText: 'Non, Annuler!',
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        try {
          onDelete(itemId, {
            onSuccess: () => {
              swalWithBootstrapButtons.fire({
                title: 'Supprimé!',
                text: `${itemName} a été supprimé avec succès.`,
                icon: 'success',
              });
            },
            onError: (e) => {
              swalWithBootstrapButtons.fire({
                title: 'Erreur',
                text:
                  e?.response?.data?.message ||
                  'Une erreur est survenue lors de la suppression.',
                icon: 'error',
              });
            },
          });
        } catch (e) {
          swalWithBootstrapButtons.fire({
            title: 'Erreur',
            text:
              e ||
              e?.response?.data?.message ||
              'Une erreur est survenue lors de la suppression.',
            icon: 'error',
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: 'Suppression annulée',
          icon: 'error',
        });
      }
    });
}
