import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routeConfig } from './config'

const router = createBrowserRouter(routeConfig)

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
