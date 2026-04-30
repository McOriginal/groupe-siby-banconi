import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
} from '../components/capitalizeFunction';
import { deleteButton } from '../components/AlerteModal';
import {
  useAllFournisseur,
  useDeleteFournisseur,
} from '../../Api/queriesFournisseur';
import FournisseurForm from './FournisseurForm';

export default function FournisseurListe() {
  const [form_modal, setForm_modal] = useState(false);
  /**
   * OPTIMISATION PRO (Fournisseurs)
   *
   * Avant:
   * - Chargement complet + recherche côté navigateur
   *
   * Maintenant:
   * - Mode backend `paged=1` (même endpoint)
   * - Recherche serveur `q`
   * - Pagination + cache React Query
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { mutate: deleteFournisseur, isDeleting } = useDeleteFournisseur();
  const [fournisseurToUpdate, setFournisseurToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState(
    'Ajouter un Fournisseur'
  );

  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce (évite spam réseau) + reset page
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: fournisseurData, isLoading, error } = useAllFournisseur({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
  });

  // Données paginées (on garde le nom `filteredFournisseurs` pour ne pas toucher le reste)
  const filteredFournisseurs = fournisseurData?.items || [];
  const total = fournisseurData?.total ?? 0;
  const totalPages = fournisseurData?.totalPages ?? 1;

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Fournisseurs'
            breadcrumbItem='List des fournisseurs'
          />

          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <FournisseurForm
                fournisseurToEdit={fournisseurToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='fournisseursList'>
                    <Row className='g-4 mb-3'>
                      <Col className='col-sm-auto'>
                        <div className='d-flex gap-1'>
                          <Button
                            color='info'
                            className='add-btn'
                            id='create-btn'
                            onClick={() => {
                              setFournisseurToUpdate(null);
                              tog_form_modal();
                            }}
                          >
                            <i className='fas fa-ambulance align-center me-1'></i>{' '}
                            Ajouter un Fournisseur
                          </Button>
                        </div>
                      </Col>
                      <Col>
                        <p className='text-center font-size-15 mt-2'>
                          Fournisseurs Total:{' '}
                          <span className='text-warning'>
                            {' '}
                            {total}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col className='col-sm'>
                        <div className='d-flex justify-content-sm-end gap-2 flex-wrap'>
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

                        {/* Pagination (en haut) */}
                        {!error && !isLoading && totalPages > 1 && (
                          <div className='d-flex justify-content-sm-end align-items-center gap-2 flex-wrap mt-2'>
                            <div
                              className='d-inline-flex gap-2'
                              role='group'
                              aria-label='Pagination fournisseurs'
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
                                onClick={() =>
                                  setPage((p) => Math.min(totalPages, p + 1))
                                }
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
                              <span className='text-dark small fw-semibold'>
                                Par page
                              </span>
                              <select
                                className='form-select form-select-sm border border-primary'
                                style={{ width: 95 }}
                                value={limit}
                                onChange={(e) => {
                                  setLimit(Number(e.target.value));
                                  setPage(1);
                                }}
                              >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card mt-3 mb-1'>
                      {!filteredFournisseurs?.length &&
                        !isLoading &&
                        !error && (
                          <div className='text-center text-mutate'>
                            Aucun Fournisseur trouvée !
                          </div>
                        )}
                      {!error &&
                        filteredFournisseurs?.length > 0 &&
                        !isLoading && (
                          <table
                            className='table align-middle table-nowrap table-hover'
                            id='fournisseurTable'
                          >
                            <thead className='table-light'>
                              <tr className='text-center'>
                                <th scope='col' style={{ width: '50px' }}>
                                  ID
                                </th>
                                <th
                                  className='sort'
                                  data-sort='fournisseur_name'
                                >
                                  Nom
                                </th>
                                <th className='sort' data-sort='email'>
                                  Prénom
                                </th>

                                <th className='sort' data-sort='email'>
                                  Adresse Email
                                </th>

                                <th className='sort' data-sort='adresse'>
                                  Domicile
                                </th>
                                <th className='sort' data-sort='phone'>
                                  Téléphone
                                </th>

                                <th className='sort' data-sort='action'>
                                  Action
                                </th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {filteredFournisseurs?.map(
                                (fournisseur, index) => (
                                  <tr
                                    key={fournisseur._id}
                                    className='text-center'
                                  >
                                    <th scope='row'>{index + 1}</th>
                                    <td className='firstName'>
                                      {capitalizeWords(fournisseur.firstName)}{' '}
                                    </td>
                                    <td className='firstName'>
                                      {capitalizeWords(fournisseur.lastName)}{' '}
                                    </td>

                                    <td className='email'>
                                      {fournisseur.emailAdresse || '-------'}{' '}
                                    </td>

                                    <td className='adresse'>
                                      {capitalizeWords(fournisseur.adresse)}{' '}
                                    </td>
                                    <td className='phone'>
                                      {formatPhoneNumber(
                                        fournisseur.phoneNumber
                                      )}
                                    </td>

                                    <td>
                                      <div className='d-flex gap-2'>
                                        <div className='edit'>
                                          <button
                                            className='btn btn-sm btn-success edit-item-btn'
                                            data-bs-toggle='modal'
                                            data-bs-target='#showModal'
                                            onClick={() => {
                                              setFormModalTitle(
                                                'Modifier les données'
                                              );
                                              setFournisseurToUpdate(
                                                fournisseur
                                              );
                                              tog_form_modal();
                                            }}
                                          >
                                            <i className='ri-pencil-fill text-white'></i>
                                          </button>
                                        </div>
                                        {isDeleting && <LoadingSpiner />}
                                        {!isDeleting && (
                                          <div className='remove'>
                                            <button
                                              className='btn btn-sm btn-danger remove-item-btn'
                                              data-bs-toggle='modal'
                                              data-bs-target='#deleteRecordModal'
                                              onClick={() => {
                                                deleteButton(
                                                  fournisseur._id,
                                                  fournisseur.firstName +
                                                    ' ' +
                                                    fournisseur.lastName,
                                                  deleteFournisseur
                                                );
                                              }}
                                            >
                                              <i className='ri-delete-bin-fill text-white'></i>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
