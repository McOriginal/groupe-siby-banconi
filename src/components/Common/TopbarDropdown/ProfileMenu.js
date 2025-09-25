import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import { AuthContext } from '../../../Auth/AuthContext';
import { connectedUserName } from '../../../Pages/Authentication/userInfos';
import { Link } from 'react-router-dom';

const ProfileMenu = (props) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  const { logout } = useContext(AuthContext);
  // const handleLogout = logout();

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className='d-inline-block'
      >
        <DropdownToggle
          className='btn header-item justify-content-center d-flex align-items-center'
          id='page-header-user-dropdown'
          tag='button'
        >
          <span className='fw-bold font-size-11 text-warning d-inline-block ms-2 me-2'>
            {connectedUserName?.toUpperCase()}
          </span>
          <i className='mdi mdi-chevron-down d-xl-inline-block' />
        </DropdownToggle>
        <DropdownMenu className='dropdown-menu-end'>
          <DropdownItem>
            <Link to='/userprofile'>
              {' '}
              <i className='ri-user-line align-middle me-2' />
              Profile{' '}
            </Link>
          </DropdownItem>

          <div className='dropdown-divider' />
          <DropdownItem
            onClick={() => logout()}
            className='dropdown-item bg-danger text-white cursor-pointer'
          >
            <i className='ri-shut-down-line align-middle me-2 text-white' />
            Déconnecter
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any,
};

export default ProfileMenu;
