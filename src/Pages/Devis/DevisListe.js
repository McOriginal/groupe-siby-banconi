import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  Col,
  Container,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';

import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';

import { useAllDevis } from '../../Api/queriesDevis';
import { useNavigate } from 'react-router-dom';
import FactureHeader from '../Commandes/Details/FactureHeader';
import LogoFiligran from '../Commandes/Details/LogoFiligran';
import { companyName } from '../CompanyInfo/CompanyInfo';
import { connectedUserBoutique } from '../Authentication/userInfos';

export default function DevisListe() {
  // Afficher tous les Devis
  const { data: devisData, isLoading, error } = useAllDevis();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  // Fonction de Recherche dans la barre de recherche
  const filterDevis = devisData
    ?.filter((fac) => {
      const search = searchTerm.toLowerCase();
      return (
        fac?.fullName.toLowerCase().includes(search) ||
        fac?.phoneNumber.toString().includes(search) ||
        fac?.adresse.toLowerCase().includes(search) ||
        fac?.totalAmount?.toString().includes(search) ||
        new Date(fac?.createdAt).toLocaleDateString('fr-FR').includes(search)
      );
    })
    ?.filter((item) => {
      if (selectedBoutique !== null) {
        return Number(item.user?.boutique) === selectedBoutique;
      }
      return true;
    });

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Devis' breadcrumbItem='Liste de Devis' />

          <Card className='p-4'>
            <div className=' d-flex align-items-center gap-3 mb-4 justify-content-between flex-wrap'>
              {/* Selectonner la boutique */}
              <div className='mb-3'>
                <h6>Filtrer par Boutique </h6>
                <select
                  value={selectedBoutique ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedBoutique(v === '' ? null : Number(v));
                  }}
                  className='form-select border border-dark rounded '
                  style={{ cursor: 'pointer' }}
                >
                  <option value=''>Toutes</option>
                  <option value={connectedUserBoutique ?? 0}>
                    {connectedUserBoutique ?? 0} - Ma Boutique
                  </option>
                  {connectedUserBoutique === 1 ? (
                    <option value='2'>Boutique - 2</option>
                  ) : connectedUserBoutique === 2 ? (
                    <option value='1'>Boutique - 1</option>
                  ) : (
                    <optgroup label='autres'>
                      <option value='1'>Boutique - 1</option>
                      <option value='2'>Boutique - 2</option>
                    </optgroup>
                  )}
                </select>
              </div>

              <div className='search-box me-2 d-flex align-items-center gap-2'>
                {searchTerm !== '' && (
                  <Button color='danger' onClick={() => setSearchTerm('')}>
                    <i className='fas fa-window-close'></i>
                  </Button>
                )}
                <input
                  type='text'
                  className='form-control search border border-dark rounded'
                  placeholder='Rechercher...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <h5>
              Total Enregistrée:{' '}
              <span className='text-info'>
                {formatPrice(filterDevis?.length)}
              </span>
            </h5>
          </Card>
          {error && (
            <div className='text-danger text-center'>
              Erreur de chargement des données
            </div>
          )}
          {isLoading && <LoadingSpiner />}
          {!error && filterDevis?.length === 0 && (
            <div className='mt-4 d-flex justify-content-center align-items-center flex-column'>
              <p className='text-center font-size-18 text-secondary'>
                Aucun Devis enregistré !
              </p>

              <Button
                color='info'
                className='add-btn mt-2'
                onClick={() => navigate('/newDevis')}
              >
                <i className='fas fa-plus align-center me-1'></i> Ajouter un
                Devis
              </Button>
            </div>
          )}
          {filterDevis?.length > 0 &&
            filterDevis?.map((dev, index) => (
              <div
                key={index}
                className='d-flex flex-column justify-content-center my-4'
              >
                {/* // Bouton */}
                <Col className='col-sm-auto mb-3'>
                  <div className='d-flex gap-4  justify-content-center align-items-center'>
                    <Button
                      color='info'
                      className='add-btn'
                      id='create-btn'
                      onClick={() => navigate(`/devis/getOneDevis/${dev?._id}`)}
                    >
                      <i className='bx bx-show align-center me-1'></i> Détails
                    </Button>
                  </div>
                </Col>
                {/* // ------------------------------------------- */}

                {/* // ------------------------------------------- */}
                <Card
                  className='d-flex justify-content-center border border-info'
                  style={{
                    boxShadow: '0px 0px 10px rgba(100, 169, 238, 0.5)',
                    borderRadius: '15px',
                    width: '583px',
                    margin: '5px auto',
                    position: 'relative',
                  }}
                >
                  <CardBody>
                    <FactureHeader />
                    <div className='d-flex justify-content-between align-item-center mt-2'>
                      <CardText className='font-size-14'>
                        <strong>Motif: </strong> Devis pour:
                      </CardText>
                      <CardText>
                        <strong> Date:</strong>{' '}
                        {new Date(dev.createdAt).toLocaleDateString()}
                      </CardText>
                    </div>
                    {/* Infos Client */}
                    <div className='d-flex justify-content-between align-item-center  '>
                      <CardText>
                        <strong>Client: </strong>
                        {capitalizeWords(dev?.fullName) ||
                          '-------------------'}{' '}
                      </CardText>
                      <CardText className='me-2'>
                        <strong>Tél: </strong>
                        {formatPhoneNumber(dev?.phoneNumber) ||
                          '----------------'}
                      </CardText>
                    </div>
                    <CardText className='text-start'>
                      <strong>Adresse: </strong>
                      {capitalizeWords(dev?.adresse) || '--------------'}
                    </CardText>

                    {/* Logo Filigrant */}
                    <LogoFiligran />

                    <div className='my-2 p-2'>
                      <table className='table align-middle table-nowrap table-hover table-bordered border-2 border-info text-center'>
                        <thead>
                          <tr>
                            <th>Qté</th>
                            <th>Désignations</th>
                            <th>P.U</th>
                            <th>Montant</th>
                          </tr>
                        </thead>

                        <tbody>
                          {dev?.items.map((article) => (
                            <tr key={article._id}>
                              <td>{article?.quantity} </td>
                              <td className='text-wrap'>
                                {capitalizeWords(article?.produit?.name)}{' '}
                              </td>
                              <td>{formatPrice(article?.customerPrice)} F </td>
                              <td>
                                {formatPrice(
                                  article?.customerPrice * article?.quantity
                                )}
                                {' F'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <CardFooter>
                      <div className='p-1'>
                        <div
                          className='d-flex
                  justify-content-between align-item-center'
                        >
                          <CardText className={'text-center'}>
                            Total:{' '}
                            <strong style={{ fontSize: '14px' }}>
                              {' '}
                              {formatPrice(dev?.totalAmount)} F{' '}
                            </strong>{' '}
                          </CardText>
                        </div>
                      </div>
                      <p className='font-size-10 text-center'>
                        Merci pour votre confiance et votre achat chez{' '}
                        {companyName}. Nous espérons vous revoir bientôt!
                      </p>
                    </CardFooter>
                  </CardBody>
                </Card>
              </div>
            ))}
        </Container>
      </div>
    </React.Fragment>
  );
}
