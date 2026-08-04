import { RouterProvider } from 'react-router-dom'
import router from './config'

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
