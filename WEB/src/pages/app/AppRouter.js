import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PasswordGenerator from './PasswordGenerator';
import Error from '../../_utils/Error';

const AppRouter = () => {
    return (
        <Routes>
            <Route path='/password-generator' element={<PasswordGenerator/>}/>
            <Route path='/' element={<PasswordGenerator/>}/>
            <Route path='*' element={<Error/>}/>
        </Routes>
    );
};

export default AppRouter;