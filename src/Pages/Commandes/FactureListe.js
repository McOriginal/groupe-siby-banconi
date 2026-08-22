import React, { useState } from 'react';
import { Button, Card, CardBody, Container } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
// NOTE: suppression totale de `selectedBoutique` (demande utilisateur)
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useNavigate } from 'react-router-dom';

export default function FactureListe() {
  /**
   * IMPORTANT (demande optimisation):
   * - En historique de facture, on ne charge QUE les champs résumé
   *   (client, date, totalAmount, id)
   * - Pas de `items.produit` ici.
   * - Le détail complet est chargé uniquement au clic "Détails" (page facture).
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Debounce (évite spam réseau)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, error } = useAllPaiements({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
  });

  const factures = data?.paiements || [];

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Commande' breadcrumbItem='Historique de Factures' />

          <Card className='p-4'>
            <div className='d-flex align-items-center gap-3 mb-4 justify-content-between flex-wrap'>
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

            {/* Pagination (en haut) */}
            {!error && !isLoading && totalPages > 1 && (
              <div className='d-flex align-items-center gap-2 flex-wrap'>
                <div
                  className='d-inline-flex gap-2'
                  role='group'
                  aria-label='Pagination factures'
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
                  <span className='badge bg-info'>{total}</span> factures
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
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
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

          {!error && !isLoading && factures?.length === 0 && (
            <div className='text-center text-secondary mt-4'>
              Aucune facture pour le moment.
            </div>
          )}

          {!error && !isLoading && factures?.length > 0 && (
            <Card className='mt-3'>
              <CardBody>
                <div className='table-responsive'>
                  <table className='table align-middle table-nowrap table-hover'>
                    <thead className='table-light'>
                      <tr className='text-center'>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className='text-center'>
                      {factures.map((fac) => (
                        <tr key={fac?._id}>
                          <td>
                            {new Date(
                              fac?.commande?.commandeDate || fac?.paiementDate
                            ).toLocaleDateString('fr-FR')}
                          </td>
                          <td>{capitalizeWords(fac?.commande?.fullName)}</td>
                          <td>
                            {formatPhoneNumber(fac?.commande?.phoneNumber) ||
                              '---'}
                          </td>
                          <td className='text-info'>
                            {formatPrice(fac?.totalAmount)} F
                          </td>
                          <td>
                            <Button
                              color='info'
                              size='sm'
                              className='shadow-sm'
                              onClick={() =>
                                // Détail complet (articles) chargé sur la page facture
                                navigate(`/facture/${fac?.commande?._id}`)
                              }
                            >
                              <i className='bx bx-show align-center me-1'></i>
                              Détails
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
