import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import './App.css';
import ErrorPage from './components/ErrorPage';
import { dashboardLoader } from "./loaders/dashboardLoader";
import ConfirmPassword from "./routes/ConfirmPassword";
import Dashboard from './routes/Dashboard';
import Index from './routes/Index';
import Login from './routes/Login';
import Register from './routes/Register';
import ResetPassword from "./routes/ResetPassword";
import Verify from "./routes/Verify";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      <Route path='/' element={<Index />} />
      <Route path='login' element={<Login />} />
      <Route path='reset-password' element={<ResetPassword />} />
      <Route path='reset-password/confirm/:email' element={<ConfirmPassword />} />
      <Route path='register' element={<Register />} />
      <Route path='register/verify/:email' element={<Verify />} />
      <Route path='logout' />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader} />
    </Route>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
