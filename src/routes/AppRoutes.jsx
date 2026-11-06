import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdoptionCreatePage from '../pages/AdoptionCreatePage';
import AdoptionDetailPage from '../pages/AdoptionDetailPage';
import AdoptionListPage from '../pages/AdoptionListPage';
import PetCreatePage from '../pages/PetCreatePage';
import PetDetailPage from '../pages/PetDetailPage';
import PetEditPage from '../pages/PetEditPage';
import PetListPage from '../pages/PetListPage';
import PhotoDetailPage from '../pages/PhotoDetailPage';
import PhotoListPage from '../pages/PhotoListPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewHomePage from '../pages/ReviewHomePage';
import ReviewListPage from '../pages/ReviewListPage';
import ShelterCreatePage from '../pages/ShelterCreatePage';
import ShelterDetailPage from '../pages/ShelterDetailPage';
import ShelterEditPage from '../pages/ShelterEditPage';
import ShelterEventDetailPage from '../pages/ShelterEventDetailPage';
import ShelterEventsPage from '../pages/ShelterEventsPage';
import ShelterListPage from '../pages/ShelterListPage';
import { PHOTO_OWNER } from '../utils/photoOwners';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/mascotas" replace />} />
        <Route path="/mascotas" element={<PetListPage />} />
        <Route path="/mascotas/nueva" element={<PetCreatePage />} />
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
        <Route path="/mascotas/:id/editar" element={<PetEditPage />} />
        <Route path="/mascotas/:id/fotos" element={<PhotoListPage owner={PHOTO_OWNER.PET} />} />
        <Route
          path="/mascotas/:id/fotos/:photoId"
          element={<PhotoDetailPage owner={PHOTO_OWNER.PET} />}
        />
        <Route path="/adopciones" element={<AdoptionListPage />} />
        <Route path="/adopciones/nueva" element={<AdoptionCreatePage />} />
        <Route path="/mis-resenas" element={<ReviewHomePage />} />
        <Route path="/adoptantes/:adopterId/resenas" element={<ReviewListPage />} />
        <Route path="/adoptantes/:adopterId/resenas/:reviewId" element={<ReviewDetailPage />} />
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
        <Route path="/refugios" element={<ShelterListPage />} />
        <Route path="/refugios/nuevo" element={<ShelterCreatePage />} />
        <Route path="/refugios/:id" element={<ShelterDetailPage />} />
        <Route path="/refugios/:id/editar" element={<ShelterEditPage />} />
        <Route path="/refugios/:id/fotos" element={<PhotoListPage owner={PHOTO_OWNER.SHELTER} />} />
        <Route
          path="/refugios/:id/fotos/:photoId"
          element={<PhotoDetailPage owner={PHOTO_OWNER.SHELTER} />}
        />
        <Route path="/refugios/:id/eventos" element={<ShelterEventsPage />} />
        <Route path="/refugios/:id/eventos/:eventId" element={<ShelterEventDetailPage />} />
      </Route>
    </Routes>
  );
}