import { createBrowserRouter } from 'react-router-dom'
import RegisterPage from '../pages/auth/RegisterPage'
import LoginPage from '../pages/auth/LoginPage'

export const router = createBrowserRouter([

    // --- ROUTES PUBLIQUES ---

  {
    path: '/register',
    element: <RegisterPage />,
  },
{
  path: '/login',
  element: <LoginPage />,
}

 // --- ROUTES PRIVÉES (Protégées) ---



])