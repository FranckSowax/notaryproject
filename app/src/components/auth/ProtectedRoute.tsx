import { Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Auth desactivee temporairement - acces libre au dashboard
  return <Outlet />;
}
