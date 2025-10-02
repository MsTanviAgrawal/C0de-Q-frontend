import React from 'react'
import { useTranslation } from 'react-i18next'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import './Users.css'
import Userslist from './Userslist'

const Users = ({ slidein }) => {
  const { t } = useTranslation()

  return (
    <div className="home-container-1">
      <Leftsidebar slidein={slidein} />
      <div className="home-container-2" style={{ marginTop: "30px" }}>
        <h1 style={{ fontWeight: "400", paddingBottom: "20px" }}>
          {t('users.allUsers') || t('sidebar.users') || 'Users'}
        </h1>
        <Userslist />
      </div>
    </div>
  )
}

export default Users
