import React from 'react';
import Home from './Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Error from '../../_utils/Error';

const HomeRouter = () => {
    return (
        <Routes>
          <Route index element={<Home/>}/>
          
          <Route path="/home" element={<Home/>}/>

          <Route path='*' element={<Error/>}/>
        </Routes>
    );
};

export default HomeRouter;