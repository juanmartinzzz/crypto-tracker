import './index.css';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChangeTracker from './components/changeTracker/ChangeTracker.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChangeTracker />,
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
