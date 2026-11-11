import apiClient from './apiClient';

const ADOPTERS_URL = '/adopters';

export async function getAdopters() {
    const { data } = await apiClient.get(ADOPTERS_URL);
    return data;
}

export async function getAdopter(id) {
    const { data } = await apiClient.get(`${ADOPTERS_URL}/${id}`);
    return data;
}

export async function createAdopter(adopter) {
    const { data } = await apiClient.post(ADOPTERS_URL, adopter);
    return data;
}

export async function updateAdopter(id, adopter) {
    const { data } = await apiClient.put(`${ADOPTERS_URL}/${id}`, adopter);
    return data;
}

export async function deleteAdopter(id) {
    await apiClient.delete(`${ADOPTERS_URL}/${id}`);
}
