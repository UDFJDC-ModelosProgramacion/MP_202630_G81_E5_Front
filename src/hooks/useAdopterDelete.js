import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAdopter } from '../services/adopterService';
import { getAdopterDeleteErrorMessage } from '../utils/adopterMessages';

// Borrado del propio perfil: pide confirmación, borra y vuelve al listado.
export default function useAdopterDelete(adopter) {
const navigate = useNavigate();
const [state, setState] = useState({ deleting: false, error: null });

const remove = async () => {
    if (!window.confirm(`¿Eliminar tu cuenta, ${adopter.name}? Esta acción no se puede deshacer.`)) {
    return;
    }

    setState({ deleting: true, error: null });
    try {
    await deleteAdopter(adopter.id);
    await navigate('/adoptantes', {
        state: { message: `Adoptante ${adopter.name} eliminado correctamente.` },
    });
    } catch (error) {
    setState({ deleting: false, error: getAdopterDeleteErrorMessage(error, adopter, true) });
    }
};

return { ...state, remove };
}
