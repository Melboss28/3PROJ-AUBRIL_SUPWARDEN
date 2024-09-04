import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PasswordGenerator from './PasswordGenerator';
import Trousseaux from './Trousseaux';
import TrousseauxDetails from './TrousseauxDetails';
import Account from './Account';
import Error from '../../_utils/Error';
import Element from './Element';
import ChatApp from './ChatApp';

const AppRouter = () => {
    return (
        <Routes>
            <Route path='/password-generator' element={<PasswordGenerator/>}/>
            <Route path='/trousseaux' element={<Trousseaux/>}/>
            <Route path='/trousseaux/:id' element={<TrousseauxDetails/>}/>
            <Route path='/trousseaux/:id/element/:elementId' element={<Element/>}/>
            <Route path='/account' element={<Account/>}/>
            <Route path='/chat' element={<ChatApp/>}/>
            <Route path='/' element={<Trousseaux/>}/>
            <Route path='*' element={<Error/>}/>
        </Routes>
    );
};

export default AppRouter;