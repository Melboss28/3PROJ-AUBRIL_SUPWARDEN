import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Groups from './Groups';
// import Account from './Account';
// import GroupDetails from './GroupDetails';
// import GroupMembers from './GroupMembers';
import Error from '../../_utils/Error';

const AppRouter = () => {
    return (
        <Routes>
            {/* <Route index element={<Groups/>}/> */}
            {/* <Route path='/groups' element={<Groups/>}/> */}
            {/* <Route path='/group/:id' element={<GroupDetails/>}/> */}
            {/* <Route path='/group/:id/members' element={<GroupMembers/>}/> */}
            {/* <Route path='/account' element={<Account/>}/> */}
            <Route path='*' element={<Error/>}/>
        </Routes>
    );
};

export default AppRouter;