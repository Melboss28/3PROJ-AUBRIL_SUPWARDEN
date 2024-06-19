import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomeRouter from './pages/home/HomeRouter';
import AppRouter from './pages/app/AppRouter';
import AuthRouter from './pages/auth/AuthRouter';
import Error from './_utils/Error';
import AuthGuard from './_helpers/AuthGuard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<HomeRouter />} />
          <Route path="/app/*" element={
            <AuthGuard>
              <AppRouter/>
            </AuthGuard>
          } />
          <Route path="/auth/*" element={<AuthRouter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
