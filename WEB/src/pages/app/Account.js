import React, { useState } from 'react'
import VerticalNavbar from '../../components/VerticalNavbar';
import './account.css'
import AccountEdit from '../../components/app/AccountEdit';
import AccountPasswordEdit from '../../components/app/AccountPassword';
import AccountDelete from '../../components/app/AccountDelete';
import AccountLink from '../../components/app/AccountLink';

const Account = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="page">
        <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
          <h1>Account</h1>
          <div className="account">
            <AccountEdit/>
            <AccountPasswordEdit/>
            <AccountDelete/>
            <AccountLink/>
          </div>
        </div>
      </div>
    )
}

export default Account