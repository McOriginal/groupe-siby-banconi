import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../../components/AlerteModal';
import LoadingSpiner from '../../components/LoadingSpiner';
import { useOneCommande } from '../../../Api/queriesCommande';
import { useParams } from 'react-router-dom';
import {
  useAllLivraisonHistorique,
  useCreateLivraisonHistorique,
  useUpdateLivraisonHistorique,
} from '../../../Api/queriesLivraisonHistorique';
import { capitalizeWords } from '../../components/capitalizeFunction';

const LivraisonHistoriqueForm = ({
  selectedLivraisonToUpdate,
  tog_form_modal,
}) => {
  // Récuperation de ID dans URL en utilisant UsParams
  const selectedCommande = useParams();

  // Paiement Query pour créer la Paiement
  const { mutate: createLivraisonHistorique } = useCreateLivraisonHistorique();

  // Mettre à jours une Livraison
  const { mutate: updateLivraison } = useUpdateLivraisonHistorique();

  const { data: livraisonHistoriqueData } = useAllLivraisonHistorique(
    selectedCommande.id
  );
  // Query pour affiche toutes les selectedCommandeData
  const {
    data: selectedCommandeData,
    isLoading: fetchingCommande,
    error: commandeDataError,
  } = useOneCommande(selectedCommande.id);

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);
  // ------------------------------------------------------------------------
  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      commande:
        selectedLivraisonToUpdate?.commande?._id || selectedCommande?.id,
      produit: selectedLivraisonToUpdate?.produit || '',
      quantity: selectedLivraisonToUpdate?.quantity || 0,
      livraisonDate:
        selectedLivraisonToUpdate?.livraisonDate?.substring(0, 10) || undefined,
    },
    validationSchema: Yup.object({
      produit: Yup.string().required('Ce champ est obligatoire'),
      quantity: Yup.string().required('Ce champ est obligatoire'),
      livraisonDate: Yup.date().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);
      // Si la méthode est pour mise à jour alors
      const livraisonDataLoaded = {
        ...values,
      };

      if (selectedLivraisonToUpdate) {
        updateLivraison(
          {
            id: selectedLivraisonToUpdate?._id,
            data: livraisonDataLoaded,
          },
          {
            onSuccess: () => {
              successMessageAlert('Mise à jour avec succès');
              setIsLoading(false);
              tog_form_modal();
            },
            onError: (err) => {
              errorMessageAlert(
                err?.response?.data?.message ||
                  err?.message ||
                  'Erreur lors de la mise à jour'
              );
              setIsLoading(false);
            },
          }
        );
      } else {
        // on ajoute le paiements dans l'historique
        createLivraisonHistorique(
          { ...values, commande: selectedCommande.id },
          {
            onSuccess: () => {
              successMessageAlert('Livraison ajoutée avec succès');
              setIsLoading(false);
              resetForm();
              tog_form_modal();
            },
            onError: (err) => {
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Oh Oh ! une erreur est survenu lors de l'enregistrement";
              errorMessageAlert(errorMessage);
              setIsLoading(false);
            },
          }
        );
      }
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });

  // Trouver la quantité de PRODUIT sélectionné dans la liste
  const [maxQuantity, setMaxQuantity] = useState(validation.values.quantity);
  useEffect(() => {
    // Selected Item
    const selectedItem = selectedCommandeData?.commandeData?.items?.find(
      (it) => it?.produit?.name === validation.values.produit
    );

    // Selected Item Produit qui se trouve dans Livraison Historique data pour calculer le total de Quantité Livrés
    const historiqueProduitInCommande = livraisonHistoriqueData?.filter(
      (data) => {
        return data?.produit.includes(validation.values.produit);
      }
    );
    // Calculer la somme total de Quantité de produit sélectionné
    const totalQuantityDelivry = historiqueProduitInCommande?.reduce(
      (acc, item) => (acc += item.quantity),
      0
    );

    if (selectedItem) {
      // Quantité de Produit sélectionné
      const selectedItemQuantity = selectedItem?.quantity;
      // Si le bouton modifier est cliqué alors on affiche la Quantité Livré SINON on Soustraire la Quantité Livré au Quantité restante
      const quantityToDelivry = selectedLivraisonToUpdate
        ? selectedLivraisonToUpdate?.quantity
        : selectedItemQuantity - totalQuantityDelivry;
      // Réinitialiser le champ Quantité par la Quantité restante
      validation.setFieldValue('quantity', quantityToDelivry);
      setMaxQuantity(
        selectedLivraisonToUpdate ? selectedItemQuantity : quantityToDelivry
      );
    }
  }, [
    selectedLivraisonToUpdate,
    selectedCommandeData,
    validation.values.produit,
    livraisonHistoriqueData,
  ]);

  // console.log('Validation Quantité: ', validation.values.quantity);
  // Affichage des champs de Formulaire
  return (
    <Form
      className='needs-validation'
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
    >
      <Row>
        {fetchingCommande && <LoadingSpiner />}

        {commandeDataError && (
          <p className='text-center text-danger'>
            Erreur de trouver les Produit
          </p>
        )}
        {!commandeDataError && !fetchingCommande && (
          <Col sm={12}>
            <FormGroup className='mb-3'>
              <Label htmlFor='produit'>Produit</Label>

              <Input
                name='produit'
                type='select'
                placeholder='Produit'
                className='form-control border-1 border-dark'
                id='produit'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.produit || ''}
                invalid={
                  validation.touched.produit && validation.errors.produit
                    ? true
                    : false
                }
              >
                <option value=''>Sélectionner un Produit</option>

                {selectedLivraisonToUpdate ? (
                  <option value={selectedLivraisonToUpdate?.produit}>
                    {capitalizeWords(selectedLivraisonToUpdate?.produit)}
                  </option>
                ) : (
                  selectedCommandeData?.commandeData?.items?.map((item) => (
                    <option
                      key={item?.produit?._id}
                      value={item?.produit?.name}
                    >
                      {capitalizeWords(item?.produit?.name)}{' '}
                    </option>
                  ))
                )}
              </Input>
              {validation.touched.produit && validation.errors.produit ? (
                <FormFeedback type='invalid'>
                  {validation.errors.produit}
                </FormFeedback>
              ) : null}
            </FormGroup>
          </Col>
        )}
      </Row>
      <Row>
        <Col sm={12}>
          <FormGroup className='mb-3'>
            <Label htmlFor='quantity'>
              {' '}
              {selectedLivraisonToUpdate
                ? 'Quantité Livrée'
                : 'Quantité Restante'}{' '}
            </Label>

            <Input
              name='quantity'
              type='number'
              className='form-control border-1 border-dark'
              id='quantity'
              min={1}
              max={maxQuantity}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.quantity || 0}
              invalid={
                validation.touched.quantity && validation.errors.quantity
                  ? true
                  : false
              }
            />

            {validation.touched.quantity && validation.errors.quantity ? (
              <FormFeedback type='invalid'>
                {validation.errors.quantity}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='livraisonDate'>Date de Livraison</Label>

            <Input
              name='livraisonDate'
              type='date'
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className='form-control border-1 border-dark'
              id='livraisonDate'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.livraisonDate || ''}
              invalid={
                validation.touched.livraisonDate &&
                validation.errors.livraisonDate
                  ? true
                  : false
              }
            />
            {validation.touched.livraisonDate &&
            validation.errors.livraisonDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.livraisonDate}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>

      <div className='d-grid text-center mt-4'>
        {isLoading && <LoadingSpiner />}
        {!isLoading && (
          <Button color='success' type='submit'>
            Enregisrer
          </Button>
        )}
      </div>
    </Form>
  );
};

export default LivraisonHistoriqueForm;
