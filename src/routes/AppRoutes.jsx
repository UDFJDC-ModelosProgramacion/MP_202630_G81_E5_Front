import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AdopterCreatePage from '../pages/AdopterCreatePage';
import AdopterDetailPage from '../pages/AdopterDetailPage';
import AdopterEditPage from '../pages/AdopterEditPage';
import AdopterListPage from '../pages/AdopterListPage';
import AdoptionCreatePage from '../pages/AdoptionCreatePage';
import AdoptionDetailPage from '../pages/AdoptionDetailPage';
import AdoptionListPage from '../pages/AdoptionListPage';
import TrialCohabitationPage from '../pages/TrialCohabitationPage';
import NotificationDetailPage from '../pages/NotificationDetailPage';
import NotificationListPage from '../pages/NotificationListPage';
import MessageDetailPage from '../pages/MessageDetailPage';
import MessageHomePage from '../pages/MessageHomePage';
import MessageListPage from '../pages/MessageListPage';
import PetCreatePage from '../pages/PetCreatePage';
import PetDetailPage from '../pages/PetDetailPage';
import PetEditPage from '../pages/PetEditPage';
import PetListPage from '../pages/PetListPage';
import VaccinationRecordCreatePage from '../pages/VaccinationRecordCreatePage';
import VaccinationRecordEditPage from '../pages/VaccinationRecordEditPage';
import VaccinationRecordPage from '../pages/VaccinationRecordPage';
import PhotoDetailPage from '../pages/PhotoDetailPage';
import PhotoListPage from '../pages/PhotoListPage';
import ReturnRecordPage from '../pages/ReturnRecordPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewHomePage from '../pages/ReviewHomePage';
import ReviewListPage from '../pages/ReviewListPage';
import ShelterCreatePage from '../pages/ShelterCreatePage';
import ShelterDetailPage from '../pages/ShelterDetailPage';
import ShelterEditPage from '../pages/ShelterEditPage';
import ShelterEventDetailPage from '../pages/ShelterEventDetailPage';
import ShelterEventsPage from '../pages/ShelterEventsPage';
import ShelterListPage from '../pages/ShelterListPage';
import ShelterVideosPage from '../pages/ShelterVideosPage';
import VeterinarianCreatePage from '../pages/VeterinarianCreatePage';
import VeterinarianDetailPage from '../pages/VeterinarianDetailPage';
import VeterinarianEditPage from '../pages/VeterinarianEditPage';
import VeterinarianListPage from '../pages/VeterinarianListPage';
import VideoDetailPage from '../pages/VideoDetailPage';
import { PHOTO_OWNER } from '../utils/photoOwners';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mascotas" element={<PetListPage />} />
        <Route path="/mascotas/nueva" element={<PetCreatePage />} />
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
        <Route path="/mascotas/:id/editar" element={<PetEditPage />} />
        <Route path="/mascotas/:id/carnet" element={<VaccinationRecordPage />} />
        <Route path="/mascotas/:id/carnet/nuevo" element={<VaccinationRecordCreatePage />} />
        <Route path="/mascotas/:id/carnet/editar" element={<VaccinationRecordEditPage />} />
        <Route path="/mascotas/:id/fotos" element={<PhotoListPage owner={PHOTO_OWNER.PET} />} />
        <Route path="/mascotas/:id/fotos/:photoId" element={<PhotoDetailPage owner={PHOTO_OWNER.PET} />} />
        <Route path="/adopciones" element={<AdoptionListPage />} />
        <Route path="/adopciones/nueva" element={<AdoptionCreatePage />} />
        <Route path="/mis-resenas" element={<ReviewHomePage />} />
        <Route path="/adoptantes/:adopterId/resenas" element={<ReviewListPage />} />
        <Route path="/adoptantes/:adopterId/resenas/:reviewId" element={<ReviewDetailPage />} />
        <Route path="/mis-mensajes" element={<MessageHomePage />} />
        <Route path="/adoptantes/:adopterId/mensajes" element={<MessageListPage />} />
        <Route path="/adoptantes/:adopterId/mensajes/:messageId" element={<MessageDetailPage />} />
        <Route path="/adopciones/:id" element={<AdoptionDetailPage />} />
        <Route path="/adopciones/:id/devolucion" element={<ReturnRecordPage />} />
        <Route path="/adopciones/:id/convivencia-prueba/nueva" element={<TrialCohabitationPage mode="create" />} />
        <Route path="/adopciones/:id/convivencia-prueba/editar" element={<TrialCohabitationPage mode="edit" />} />
        <Route path="/adoptantes" element={<AdopterListPage />} />
        <Route path="/adoptantes/nuevo" element={<AdopterCreatePage />} />
        <Route path="/adoptantes/:id" element={<AdopterDetailPage />} />
        <Route path="/adoptantes/:id/editar" element={<AdopterEditPage />} />
        <Route path="/refugios" element={<ShelterListPage />} />
        <Route path="/refugios/nuevo" element={<ShelterCreatePage />} />
        <Route path="/refugios/:id" element={<ShelterDetailPage />} />
        <Route path="/refugios/:id/editar" element={<ShelterEditPage />} />
        <Route path="/refugios/:id/fotos" element={<PhotoListPage owner={PHOTO_OWNER.SHELTER} />} />
        <Route path="/refugios/:id/fotos/:photoId" element={<PhotoDetailPage owner={PHOTO_OWNER.SHELTER} />}/>
        <Route path="/refugios/:id/eventos" element={<ShelterEventsPage />} />
        <Route path="/refugios/:id/eventos/:eventId" element={<ShelterEventDetailPage />} />
        <Route path="/refugios/:id/videos" element={<ShelterVideosPage />} />
        <Route path="/refugios/:id/videos/:videoId" element={<VideoDetailPage />} />
        <Route path="/refugios/:id/notificaciones" element={<NotificationListPage />} />
        <Route path="/refugios/:id/notificaciones/:notificationId" element={<NotificationDetailPage />} />
        <Route path="/veterinarios" element={<VeterinarianListPage />} />
        <Route path="/veterinarios/nuevo" element={<VeterinarianCreatePage />} />
        <Route path="/veterinarios/:id" element={<VeterinarianDetailPage />} />
        <Route path="/veterinarios/:id/editar" element={<VeterinarianEditPage />} />
      </Route>
    </Routes>
  );
}