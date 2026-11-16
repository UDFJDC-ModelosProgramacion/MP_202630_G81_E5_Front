
import apiClient from './apiClient';

const getTrialCohabitationUrl = (adoptionId) =>
    `/adoptions/${adoptionId}/trialCohabitation`;

export async function getTrialCohabitation(adoptionId) {
    const { data } = await apiClient.get(getTrialCohabitationUrl(adoptionId));
    return data;
}

export async function createTrialCohabitation(adoptionId, trialCohabitation) {
    const { data } = await apiClient.post(
    getTrialCohabitationUrl(adoptionId),
    trialCohabitation,
);
    return data;
}

export async function updateTrialCohabitation(adoptionId, trialCohabitation) {
    const { data } = await apiClient.put(
    getTrialCohabitationUrl(adoptionId),
    trialCohabitation,
);
    return data;
}

export async function deleteTrialCohabitation(adoptionId) {
    await apiClient.delete(getTrialCohabitationUrl(adoptionId));
}
