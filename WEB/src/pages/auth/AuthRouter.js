import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Signup from './SignUp';
import Error from '../../_utils/Error';

const AuthRouter = () => {
    return (
        <Routes>
            <Route index element={<Login/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>

            <Route path='*' element={<Error/>}/>
        </Routes>
    );
};

export default AuthRouter;