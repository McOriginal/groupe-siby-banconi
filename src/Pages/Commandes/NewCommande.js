import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useAllProduit } from '../../Api/queriesProduits';
import { useCreateCommande } from '../../Api/queriesCommande';
import showToastAlert from '../components/ToasMessage';

export default function NewCommande() {
  // State de navigation
  const navigate = useNavigate();

  // Query pour afficher les Médicament
  const { data: produitsData, isLoading, error } = useAllProduit();
  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = produitsData?.filter((prod) => {
    const search = searchTerm.toLowerCase();

    return (
      prod?.stock > 0 &&
      (prod.name?.toLowerCase().includes(search) ||
        prod.stock?.toString().includes(search) ||
        prod.price?.toString().includes(search))
    );
  });

  // Query pour ajouter une COMMANDE dans la base de données
  const { mutate: createCommande } = useCreateCommande();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ajoute des produits dans le panier sans besoins de la base de données
  const [cartItems, setCartsItems] = useState([]);

  //  Fonction pour ajouter les produit dans base de données
  const addToCart = (produit) => {
    setCartsItems((prevCart) => {
      // On vérifie si le produit n'existe pas déjà
      const existingItem = prevCart?.find(
        (item) => item.produit._id === produit._id
      );
      //  Si le produit existe on incrémente la quantité
      if (existingItem) {
        const updateQuantity = prevCart.map((item) =>
          item.produit._id === produit._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        showToastAlert(`Quantité ${existingItem?.quantity + 1} `);
        return updateQuantity;
      } else {
        showToastAlert('Ajoute avec succès');

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

  // Supprimer un produit du panier
  const removeFromCart = (produitId) => {
    setCartsItems((prevCart) =>
      prevCart.filter((item) => item.produit._id !== produitId)
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
      fullName: 'non défini',
      phoneNumber: undefined || 0,
      adresse: 'non défini',
      statut: 'livré',
      comDate: new Date().toISOString().substring(0, 10),
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Veillez Entrez une valeur correct !')
        .required('Ce champ est obligatoire'),

      phoneNumber: Yup.number().required('Ce champ est obligatoire'),
      adresse: Yup.string().required('Ce champ est obligatoire'),
      statut: Yup.string().required('Ce champ est obligatoire'),
      comDate: Yup.date(),
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
        commandeDate: values.comDate || new Date().substring(0, 10),
      };

      // Vérification du stock pour chaque produit
      const insufficientStockItems = cartItems.filter(
        (item) => item.quantity > item.produit.stock
      );

      if (insufficientStockItems.length > 0) {
        const names = insufficientStockItems
          .map((item) => `${item.produit.name} (stock: ${item.produit.stock})`)
          .join(', ');
        errorMessageAlert(`Stock insuffisant pour : ${capitalizeWords(names)}`);
        setIsSubmitting(false);
        return;
      }

      createCommande(payload, {
        onSuccess: () => {
          // Après on vide le panier
          clearCart();
          successMessageAlert(
            capitalizeWords('Commande Enregistrée avec succès !')
          );
          setIsSubmitting(false);
          resetForm();
          navigate('/commandes');
        },
        onError: (err) => {
          const message =
            err?.response?.data?.message ||
            err.message ||
            "Erreur lors de l'Enregistrement !";
          errorMessageAlert(message);
          setIsSubmitting(false);
        },
      });

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
          {isSubmitting && (
            <div className='d-flex justify-content-center align-items-center'>
              <LoadingSpiner />
            </div>
          )}
          {!isSubmitting && (
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
                        <Col md='6'>
                          <FormGroup className='mb-3'>
                            <Label htmlFor='comDate'>Date de Commande</Label>
                            <Input
                              name='comDate'
                              type='date'
                              max={new Date().toISOString().split('T')[0]}
                              className='form-control border-1 border-dark'
                              id='comDate'
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.comDate || ''}
                              invalid={
                                validation.touched.comDate &&
                                validation.errors.comDate
                                  ? true
                                  : false
                              }
                            />

                            {validation.touched.comDate &&
                            validation.errors.comDate ? (
                              <FormFeedback type='invalid'>
                                {validation.errors.comDate}
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

                {cartItems?.length > 0 && !isSubmitting && (
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

                    {cartItems?.length === 0 && (
                      <p className='text-center'>
                        Veuillez cliquez sur un produit pour l'ajouter dans le
                        panier
                      </p>
                    )}
                    {cartItems?.map((item, index) => (
                      <div
                        key={index}
                        className='d-flex justify-content-between align-items-center mb-2 border-bottom border-black p-2 shadow shadow-md'
                      >
                        <div>
                          <strong>{capitalizeWords(item.produit.name)}</strong>
                          <div>
                            P.U: client
                            <Input
                              type='number'
                              min={0}
                              value={item.customerPrice}
                              onChange={(e) => {
                                const newPrice =
                                  parseFloat(e.target.value) || 0;
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

                        <div className='d-flex justify-content center align-items-center gap-2 flex-column'>
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
                              step={0.1}
                              value={item.quantity}
                              onClick={(e) => e.stopPropagation()} // Évite le clic sur la carte
                              onChange={(e) => {
                                const value = parseFloat(e.target.value, 10);
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

                          {/* supprimer */}
                          <Button
                            color='danger'
                            size='sm'
                            onClick={() => removeFromCart(item.produit._id)}
                          >
                            <i className='fas fa-trash-alt'></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
          {!isSubmitting && (
            <div className='d-flex justify-content-center gap-2'>
              <Button
                color='warning'
                onClick={() => {
                  navigate('/commandes');
                }}
              >
                <i className=' fas fa-angle-double-left me-2'></i>
                Annuler la Commande
              </Button>
            </div>
          )}
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
                  <div className='d-flex justify-content-center align-items-center gap-4 flex-wrap'>
                    {!error &&
                      filterSearchProduits?.length > 0 &&
                      filterSearchProduits?.map((produit, index) => (
                        <Card
                          key={index}
                          className='shadow shadow-lg'
                          onClick={() => addToCart(produit)}
                          style={{
                            cursor: 'pointer',
                            width: '210px',
                          }}
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
