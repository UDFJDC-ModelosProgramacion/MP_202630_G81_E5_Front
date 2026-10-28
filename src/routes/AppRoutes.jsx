import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdoptionCreatePage from '../pages/AdoptionCreatePage';
import AdoptionDetailPage from '../pages/AdoptionDetailPage';
import AdoptionListPage from '../pages/AdoptionListPage';
import PetCreatePage from '../pages/PetCreatePage';
import PetDetailPage from '../pages/PetDetailPage';
import PetEditPage from '../pages/PetEditPage';
import PetListPage from '../pages/PetListPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewHomePage from '../pages/ReviewHomePage';
import ReviewListPage from '../pages/ReviewListPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/mascotas" replace />} />
        <Route path="/mascotas" element={<PetListPage />} />
        <Route path="/mascotas/nueva" element={<PetCreatePage />} />
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
        <Route path="/mascotas/:id/editar" element={<PetEditPage />} />
        <Route path="/adopciones" element={<AdoptionListPage />} />
        <Route path="/adopciones/nueva" element={<AdoptionCreatePage />} />
        <Route path="/mis-resenas" element={<ReviewHomePage />} />
        <Route path="/adoptantes/:adopterId/resenas" element={<ReviewListPage />} />
        <Route path="/adoptantes/:adopterId/resenas/:reviewId" element={<ReviewDetailPage />} />
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
      </Route>
    </Routes>
  );
}