import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import defaultImg from './../../assets/images/no_image.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAllProduit } from '../../Api/queriesProduits';
import { useOneCommande, useUpdateCommande } from '../../Api/queriesCommande';
import showToastAlert from '../components/ToasMessage';

export default function UpdateCommande() {
  // State de navigation
  const navigate = useNavigate();
  // Query de Commande Sélectionnée
  const { id } = useParams();
  // Query pour afficher les Médicament
  const { data: produitsData, isLoading, error } = useAllProduit();

  // Query pour Modifier une COMMANDE dans la base de données
  const { mutate: updateCommande } = useUpdateCommande();

  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = produitsData?.filter((prod) => {
    const search = searchTerm.toLowerCase();

    return (
      prod?.name?.toLowerCase().includes(search) ||
      prod?.stock?.toString().includes(search) ||
      prod?.price?.toString().includes(search)
    );
  });

  const { data: selectedCommande } = useOneCommande(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ajoute des produits dans le panier sans la base de données
  const [cartItems, setCartsItems] = useState([]);

  // ------------------------------------------------------------
  // ---- Récupération de donner de COMMANDE à Modifier
  useEffect(() => {
    if (
      selectedCommande?.commandeData &&
      selectedCommande?.commandeData?.items
    ) {
      const items = selectedCommande?.commandeData?.items.map((item) => ({
        produit: item.produit,
        quantity: item.quantity,
        customerPrice: item.customerPrice ?? item.produit.price,
      }));
      setCartsItems(items);
    }
  }, [selectedCommande]);

  // ------------------------------------------------------------------

  //  Fonction pour ajouter les produit dans base de données
  const addToCart = (produit) => {
    setCartsItems((prevCart) => {
      // On vérifie si le produit n'existe pas déjà
      const existingItem = prevCart.find(
        (item) => item.produit._id === produit._id
      );

      //  Si le produit existe on incrémente la quantité
      if (existingItem) {
        return prevCart.map((item) => {
          if (item.produit._id === produit._id) {
            showToastAlert(`Quantité: ${item.quantity + 1} `);
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        showToastAlert('Ajouté avec succès');
        //  Sinon on ajoute le produit avec la quantité (1)
        return [
          ...prevCart,
          { produit, quantity: 1, customerPrice: produit.price },
        ];
      }
    });
  };

  // Fonction pour Diminuer la quantité :dans le panier
  // Si la quantité est 1 alors on le supprime
  const decreaseQuantity = (produitId) => {
    setCartsItems((prevCart) =>
      prevCart
        .map((item) =>
          item.produit._id === produitId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Fonction pour augmenter la quantité dans le panier
  const increaseQuantity = (produitId) => {
    setCartsItems((prevCart) =>
      prevCart.map((item) =>
        item.produit._id === produitId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Fonction pour vider les produits dans le panier
  const clearCart = () => {
    setCartsItems([]);
  };

  // Fonction pour calculer le total des élements dans le panier
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.customerPrice * item.quantity,
    0
  );

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      fullName: selectedCommande?.commandeData?.fullName || 'non défini',
      phoneNumber: selectedCommande?.commandeData?.phoneNumber || 0,
      adresse: selectedCommande?.commandeData?.adresse || 'non défini',
      statut: selectedCommande?.commandeData?.statut || 'livré',
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Veillez Entrez une valeur correct !')
        .required('Ce champ est obligatoire'),

      phoneNumber: Yup.number().required('Ce champ est obligatoire'),
      adresse: Yup.string().required('Ce champ est obligatoire'),
      statut: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsSubmitting(false);

      // Vérification de quantité dans le STOCK
      if (cartItems.length === 0) return;

      setIsSubmitting(true);
      const payload = {
        // Les informations du clients
        fullName: values.fullName,
        adresse: values.adresse,
        phoneNumber: values.phoneNumber,
        statut: values.statut,
        // ------------------------
        // Les ARTICLES de panier
        items: cartItems.map((item) => ({
          produit: item.produit._id,
          quantity: item.quantity,
          customerPrice: item.customerPrice,
        })),
        totalAmount,
      };

      // On passe au Modification de COMMANDE dans la table
      updateCommande(
        { commandeId: selectedCommande?.commandeData?._id, data: payload },
        {
          onSuccess: () => {
            // Après on vide le panier
            clearCart();
            successMessageAlert(
              capitalizeWords('Commande Enregistrée avec succès !')
            );
            setIsSubmitting(false);
            resetForm();
            navigate('/paiements');
          },
          onError: (err) => {
            console.log(err);
            const message =
              err?.response?.data?.message ||
              err.message ||
              "Erreur lors de l'Enregistrement !";
            errorMessageAlert(message);
            setIsSubmitting(false);
          },
        }
      );

      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsSubmitting(false);
        }
      }, 10000);
    },
  });

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Commandes' breadcrumbItem='Nouvelle Commande' />

          {/* ---------------------------------------------------------------------- */}
          {/* ---------------------------------------------------------------------- */}
          {/* Panier */}
          <Row>
            {/* ------------------------------------------------------------- */}
            {/* Les information sur Client */}
            {/* ------------------------------------------------------------- */}
            <Col md={6}>
              <Card>
                <CardTitle className='text-center m-2'>
                  Informations Client
                </CardTitle>
                <CardBody>
                  <Form
                    className='needs-validation'
                    onSubmit={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                  >
                    <Row>
                      <Col sm={6}>
                        <FormGroup>
                          <Label for='fullName'>Nom et Prénom</Label>
                          <Input
                            name='fullName'
                            id='fullName'
                            type='text'
                            className='form form-control'
                            placeholder='Nom et Prénom de Client'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.fullName || ''}
                            invalid={
                              validation.touched.fullName &&
                              validation.errors.fullName
                                ? true
                                : false
                            }
                          />
                          {validation.touched.fullName &&
                          validation.errors.fullName ? (
                            <FormFeedback type='invalid'>
                              {validation.errors.fullName}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <FormGroup>
                          <Label for='phoneNumber'>Téléphone</Label>
                          <Input
                            name='phoneNumber'
                            id='phoneNumber'
                            type='number'
                            min={0}
                            className='form form-control'
                            placeholder='N°Téléphone de Client'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.phoneNumber || ''}
                            invalid={
                              validation.touched.phoneNumber &&
                              validation.errors.phoneNumber
                                ? true
                                : false
                            }
                          />
                          {validation.touched.phoneNumber &&
                          validation.errors.phoneNumber ? (
                            <FormFeedback type='invalid'>
                              {validation.errors.phoneNumber}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={6}>
                        <FormGroup>
                          <Label for='fullName'>Adresse de Livraison</Label>
                          <Input
                            name='adresse'
                            id='adresse'
                            type='text'
                            className='form form-control'
                            placeholder="Entrez l'adresse de livraison"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.adresse || ''}
                            invalid={
                              validation.touched.adresse &&
                              validation.errors.adresse
                                ? true
                                : false
                            }
                          />
                          {validation.touched.adresse &&
                          validation.errors.adresse ? (
                            <FormFeedback type='invalid'>
                              {validation.errors.adresse}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <FormGroup>
                          <Label for='statut'>Statut de Livraison</Label>
                          <Input
                            name='statut'
                            id='statut'
                            type='select'
                            className='form form-control'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.statut || ''}
                            invalid={
                              validation.touched.statut &&
                              validation.errors.statut
                                ? true
                                : false
                            }
                          >
                            <option value=''>Sélectionner le Statut</option>
                            <option value='livré'>Livré</option>
                            <option value='en cours'>
                              Partiellement Livré
                            </option>
                            <option value='en attente'>En Attente</option>
                          </Input>
                          {validation.touched.statut &&
                          validation.errors.statut ? (
                            <FormFeedback type='invalid'>
                              {validation.errors.statut}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              {/* Bouton */}
              {isSubmitting && <LoadingSpiner />}

              {cartItems.length > 0 && !isSubmitting && (
                <div className='d-flex gap-4 my-3'>
                  <Button
                    color='warning'
                    className='fw-bold font-size-11'
                    onClick={clearCart}
                  >
                    <i className='fas fa-window-close'></i>
                  </Button>

                  <div className='d-grid' style={{ width: '100%' }}>
                    <Button
                      color='primary'
                      className='fw-bold'
                      onClick={() => validation.handleSubmit()}
                    >
                      Enregistrer la Commande
                    </Button>
                  </div>
                </div>
              )}
              {/* Bouton */}

              <Card>
                <CardBody style={{ height: '280px', overflowY: 'scroll' }}>
                  <CardTitle className='mb-4'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h4>Panier</h4>
                      <h5 className='text-warning'>
                        Total : {formatPrice(totalAmount)} F
                      </h5>
                    </div>
                  </CardTitle>

                  {cartItems.length === 0 && (
                    <p className='text-center'>
                      Veuillez cliquez sur un produit pour l'ajouter dans le
                      panier
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item.produit._id}
                      className='d-flex justify-content-between align-items-center mb-2 border-bottom border-black p-2 shadow shadow-md'
                    >
                      <div>
                        <strong>{capitalizeWords(item.produit.name)}</strong>
                        <div>
                          {/* {item.quantity} × {formatPrice(item.produit.price)} F
                          = {formatPrice(item.produit.price * item.quantity)} F */}
                          P.U: client
                          <Input
                            type='number'
                            min={0}
                            value={item.customerPrice}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              setCartsItems((prevCart) =>
                                prevCart.map((i) =>
                                  i.produit._id === item.produit._id
                                    ? { ...i, customerPrice: newPrice }
                                    : i
                                )
                              );
                            }}
                            style={{
                              width: '100px',
                              border: '1px solid #cdc606 ',
                            }}
                          />
                        </div>
                      </div>

                      <div className='d-flex align-items-center gap-2'>
                        <Button
                          color='danger'
                          size='sm'
                          onClick={() => decreaseQuantity(item.produit._id)}
                        >
                          -
                        </Button>

                        <input
                          type='number'
                          min={1}
                          value={item.quantity}
                          onClick={(e) => e.stopPropagation()} // Évite le clic sur la carte
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value > 0) {
                              setCartsItems((prevCart) =>
                                prevCart.map((i) =>
                                  i.produit._id === item.produit._id
                                    ? { ...i, quantity: value }
                                    : i
                                )
                              );
                            }
                          }}
                          style={{
                            width: '60px',
                            textAlign: 'center',
                            border: '1px solid orange',
                            borderRadius: '5px',
                          }}
                        />

                        <Button
                          color='success'
                          size='sm'
                          onClick={() => increaseQuantity(item.produit._id)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* ------------------------------------------------------------- */}
          {/* Liste des produits */}
          <div>
            <Card>
              <CardBody>
                {isLoading && <LoadingSpiner />}
                {error && (
                  <div className='text-danger text-center'>
                    Une erreur est survenue ! Veuillez actualiser la page.
                  </div>
                )}
                <Row>
                  {/* Barre de Recherche */}
                  <Col sm={12} className='my-4'>
                    <div className='d-flex justify-content-start gap-2 p-2'>
                      {searchTerm !== '' && (
                        <Button
                          color='danger'
                          onClick={() => setSearchTerm('')}
                        >
                          <i className='fas fa-window-close'></i>
                        </Button>
                      )}
                      <div className='search-box me-4'>
                        <input
                          type='text'
                          className='form-control search border border-dark rounded'
                          placeholder='Rechercher...'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </Col>

                  {/* --------------------------------------------------------------- */}
                  {/* --------------------------------------------------------------- */}
                  {/* --------------------------------------------------------------- */}
                  {/* Maping Produit Liste */}
                  <div className='d-flex flex-wrap gap-3 justify-content-center'>
                    {!error &&
                      filterSearchProduits?.length > 0 &&
                      filterSearchProduits?.map((produit) => (
                        <div key={produit._id}>
                          <Card
                            className='shadow shadow-lg'
                            onClick={() => addToCart(produit)}
                            style={{ cursor: 'pointer' }}
                          >
                            <CardImg
                              style={{
                                height: '100px',
                                objectFit: 'contain',
                              }}
                              src={
                                produit.imageUrl ? produit.imageUrl : defaultImg
                              }
                              alt={produit.name}
                            />
                            <CardBody>
                              <CardText className='text-center'>
                                {capitalizeWords(produit.name)}
                              </CardText>
                              {/* <CardText className='font-size-15 text-center'>
                                <strong>Catégorie: </strong>{' '}
                                <span className='text-info '>
                                  {' '}
                                  {capitalizeWords(produit?.category)}{' '}
                                </span>
                              </CardText> */}

                              <CardText className='text-center fw-bold'>
                                {formatPrice(produit.price)} F
                              </CardText>
                              <CardTitle className='text-center'>
                                Stock:
                                {produit.stock >= 10 ? (
                                  <span style={{ color: 'gray' }}>
                                    {' '}
                                    {formatPrice(produit?.stock)}
                                  </span>
                                ) : (
                                  <span className='text-danger'>
                                    {' '}
                                    {formatPrice(produit?.stock)}
                                  </span>
                                )}
                              </CardTitle>
                            </CardBody>
                          </Card>
                        </div>
                      ))}
                  </div>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
