import React from 'react';
import { Routes, Route } from 'react-router-dom';

// redux
import { useSelector } from 'react-redux';

//constants
import { layoutTypes } from '../constants/layout';

// layouts
import NonAuthLayout from '../Layout/NonAuthLayout';
import VerticalLayout from '../Layout/VerticalLayout/index';
import HorizontalLayout from '../Layout/HorizontalLayout/index';

import {
  authProtectedRoutes,
  publicRoutes,
  sharedRoutes,
  usersRoutes,
} from './routes';

import { createSelector } from 'reselect';
import PrivateRoute from '../Auth/PrivateRoutes';
import ConnectedUserRoute from '../Auth/ConnectedUserRoute';
import Login from '../Pages/Authentication/Login';

const getLayout = (layoutType) => {
  let Layout = VerticalLayout;
  switch (layoutType) {
    case layoutTypes.VERTICAL:
      Layout = VerticalLayout;
      break;
    case layoutTypes.HORIZONTAL:
      Layout = HorizontalLayout;
      break;
    default:
      break;
  }
  return Layout;
};

const Index = () => {
  const routepage = createSelector(
    (state) => state.Layout,
    (state) => ({
      layoutType: state.layoutType,
    })
  );
  // Inside your component
  const { layoutType } = useSelector(routepage);

  const Layout = getLayout(layoutType);

  return (
    <Routes>
      {/* Route pour vérifie si l'utilisateur est connecté alors il ne poura pas acceder à LOGIN page */}
      <Route>
        <Route
          path='/login'
          element={
            <ConnectedUserRoute>
              <Login />
            </ConnectedUserRoute>
          }
          exact={true}
        />
      </Route>

      {/* -------- Route PUBLIC pour tous------------------------------ */}
      <Route>
        {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
            key={idx}
            exact={true}
          />
        ))}
      </Route>

      {/* --------------- Routes Partager entre les utilisateurs --------------------------- */}
      {/* --------------- Routes Partager entre les utilisateurs --------------------------- */}
      <Route>
        {sharedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <PrivateRoute allowedRoles={['admin', 'user']}>
                <Layout>{route.component}</Layout>
              </PrivateRoute>
            }
            key={idx}
            exact={true}
          />
        ))}
      </Route>

      {/* ------------- Routes uniquement pour les ADMIN ------------------- */}
      <Route>
        {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Layout>{route.component}</Layout>
              </PrivateRoute>
            }
            key={idx}
            exact={true}
          />
        ))}
      </Route>

      {/*  Routes uniquement pour les  Médecins */}
      <Route>
        {usersRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              // <PrivateRoute allowedRoles={['medecin']}>
              <Layout>{route.component}</Layout>
              // </PrivateRoute>
            }
            key={idx}
            exact={true}
          />
        ))}
      </Route>
    </Routes>
  );
};

export default Index;
