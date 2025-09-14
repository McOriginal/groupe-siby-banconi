import React, { useState } from 'react';
import { Card, Container } from 'reactstrap';
import { useGetAllUsers } from '../../Api/queriesAuth';
import { useNavigate } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import BackButton from '../components/BackButton';
import FormModal from '../components/FormModal';
import UpdateUserProfile from './UpdateUserProfile';

export default function UsersProfilesListe() {
  document.title = 'Liste des Profiles';
  const {
    data: userProfileData,
    isLoading: loadingProfile,
    isError,
    error,
  } = useGetAllUsers();
  const navigate = useNavigate();
  const [form_modal, setForm_modal] = useState(false);
  const [user, setUser] = useState(null);

  const tog_form_modal = () => {
    setForm_modal(!form_modal);
  };

  return (
    <React.Fragment>
      <FormModal
        form_modal={form_modal}
        tog_form_modal={tog_form_modal}
        setForm_modal={setForm_modal}
        modal_title={'Modifier un Profile'}
        size={'md'}
        bodyContent={
          <UpdateUserProfile
            selectedUser={user}
            tog_form_modal={tog_form_modal}
          />
        }
      />

      <div className='page-content'>
        <Container fluid>
          <h4>Liste des Profiles</h4>
          <BackButton />
          <Card>
            {loadingProfile && (
              <div className='mx-auto'>
                <LoadingSpiner />
              </div>
            )}
            {isError && (
              <div colSpan='5' className='text-center text-danger'>
                Erreur : {error.message}
              </div>
            )}
            {!loadingProfile && !error && userProfileData && (
              <div className='table-responsive'>
                <table className='table table-centered table-nowrap mb-0'>
                  <thead className='table-light'>
                    <tr className='text-center'>
                      <th style={{ width: '20px' }}>Boutique</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProfileData?.length > 0 &&
                      userProfileData.map((user) => (
                        <tr key={user._id}>
                          <td>{user.boutique > 0 ? user.boutique : '-----'}</td>
                          <td className=''>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <button
                              onClick={() =>
                                navigate(`/userProfileDetails/${user._id}`)
                              }
                              className='btn btn-primary btn-sm mx-1'
                            >
                              Détails
                            </button>
                            {user.email !== 'amedicisse1@gmail.com' && (
                              <button
                                onClick={() => {
                                  setUser(user);
                                  tog_form_modal();
                                }}
                                className='btn btn-warning btn-sm mx-1'
                              >
                                Modifier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
}
