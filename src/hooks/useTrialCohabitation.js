import { useCallback, useEffect, useState } from 'react';
import { isNotFound } from '../services/apiError';
import {
    createTrialCohabitation,
    deleteTrialCohabitation,
    getTrialCohabitation,
    updateTrialCohabitation,
} from '../services/trialCohabitationService';
import { getTrialCohabitationErrorMessage } from '../utils/trialCohabitationMessages';

    async function runWithFlag(setFlag, action) {
    setFlag(true);
    try {
        return await action();
    } finally {
        setFlag(false);
    }
    }

    export default function useTrialCohabitation(adoptionId) {
    const [state, setState] = useState({
        trialCohabitation: null,
        loading: true,
        error: null,
        notFound: false,
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        getTrialCohabitation(adoptionId)
        .then((trialCohabitation) => {
            if (active) {
            setState({ trialCohabitation, loading: false, error: null, notFound: false });
            }
        })
        .catch((failure) => {
            if (active) {
            setState({
                trialCohabitation: null,
                loading: false,
                error: getTrialCohabitationErrorMessage(failure),
                notFound: isNotFound(failure),
            });
            }
        });

        return () => {
        active = false;
        };
    }, [adoptionId]);

    const setTrialCohabitation = useCallback((trialCohabitation) => {
        setState((previous) => ({
        ...previous,
        trialCohabitation,
        error: null,
        notFound: trialCohabitation === null,
        }));
    }, []);

    const registerTrialCohabitation = useCallback(
        (payload) => runWithFlag(setSaving, () => createTrialCohabitation(adoptionId, payload)),
        [adoptionId],
    );

    const editTrialCohabitation = useCallback(
        (payload) => runWithFlag(setSaving, () => updateTrialCohabitation(adoptionId, payload)),
        [adoptionId],
    );

const removeTrialCohabitation = useCallback(
    () =>
    runWithFlag(setDeleting, async () => {
        try {
            await deleteTrialCohabitation(adoptionId);
        } catch (failure) {
            if (isNotFound(failure)) setTrialCohabitation(null);
            throw failure;
        }
        setTrialCohabitation(null);
    }),
    [adoptionId, setTrialCohabitation],
);

    return {
        ...state,
        saving,
        deleting,
        registerTrialCohabitation,
        editTrialCohabitation,
        removeTrialCohabitation,
    };
}
