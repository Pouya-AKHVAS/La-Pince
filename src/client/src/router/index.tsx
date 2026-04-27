import { createBrowserRouter } from 'react-router-dom'
import RegisterPage from '../pages/auth/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // les autres routes ici
])