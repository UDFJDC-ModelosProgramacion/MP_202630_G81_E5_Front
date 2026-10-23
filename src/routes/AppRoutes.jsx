import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PetListPage from '../pages/PetListPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/mascotas" replace />} />
        <Route path="/mascotas" element={<PetListPage />} />
      </Route>
    </Routes>
  );
}