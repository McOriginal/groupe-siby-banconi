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
  /**
   * OPTIMISATION PRO (Historique de Devis)
   *
   * Avant:
   * - Chargement complet + filtre côté navigateur
   *
   * Maintenant:
   * - Mode backend `paged=1` (même endpoint)
   * - Recherche serveur `q`
   * - Pagination (évite RAM saturée)
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  // Debounce recherche (évite un appel réseau à chaque frappe)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: devisData, isLoading, error } = useAllDevis({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
    boutique: selectedBoutique ?? '',
  });

  // Données paginées
  const filterDevis = devisData?.items || [];
  const total = devisData?.total ?? 0;
  const totalPages = devisData?.totalPages ?? 1;

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
                {formatPrice(total)}
              </span>
            </h5>

            {/* Pagination (en haut) */}
            {!error && !isLoading && totalPages > 1 && (
              <div className='d-flex align-items-center gap-2 flex-wrap mt-2'>
                <div
                  className='d-inline-flex gap-2'
                  role='group'
                  aria-label='Pagination devis'
                >
                  <Button
                    color='info'
                    className='shadow-sm'
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <i className='bx bx-chevron-left'></i>
                  </Button>
                  <Button
                    color='primary'
                    className='shadow-sm'
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <i className='bx bx-chevron-right'></i>
                  </Button>
                </div>
                <span className='small fw-semibold text-dark'>
                  Page <span className='badge bg-primary'>{page}</span> /{' '}
                  <span className='badge bg-primary'>{totalPages}</span> ·{' '}
                  <span className='badge bg-info'>{total}</span> résultats
                </span>
                <div className='d-flex align-items-center gap-2'>
                  <span className='text-dark small fw-semibold'>Par page</span>
                  <select
                    className='form-select form-select-sm border border-primary'
                    style={{ width: 95 }}
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
              </div>
            )}
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
