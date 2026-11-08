import { describe, expect, it } from 'vitest';
import {
  formatVideoCount,
  getVideoDeleteErrorMessage,
  getVideoErrorMessage,
  isNotFoundShelter,
  isNotFoundVideo,
} from './videoMessages';

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });
const SHELTER_404 = apiError(404, 'The shelter with the given id was not found');
const VIDEO_404 = apiError(404, 'The video with the given id was not found');

describe('videoMessages', () => {
  it('traduce el 404 de video y el de refugio', () => {
    expect(getVideoErrorMessage(VIDEO_404)).toBe('Video no encontrado.');
    expect(getVideoErrorMessage(SHELTER_404)).toBe('Refugio no encontrado.');
  });

  it('traduce el 412 de URL inválida', () => {
    expect(getVideoErrorMessage(apiError(412, 'Video url is not valid'))).toBe(
      'La URL del video no es válida.',
    );
  });

  it('traduce el 412 de video de otro refugio', () => {
    expect(
      getVideoErrorMessage(apiError(412, 'The video is not associated to the shelter')),
    ).toBe('Este video pertenece a otro refugio.');
  });

  it('muestra el mensaje del back cuando no lo conoce', () => {
    expect(getVideoErrorMessage(apiError(412, 'Otra regla'))).toBe('Otra regla');
  });

  it('informa cuando no se puede conectar con el servidor', () => {
    expect(getVideoErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });

  it('distingue el 404 de video del de refugio', () => {
    expect(isNotFoundVideo(VIDEO_404)).toBe(true);
    expect(isNotFoundVideo(SHELTER_404)).toBe(false);
    expect(isNotFoundShelter(SHELTER_404)).toBe(true);
    expect(isNotFoundShelter(VIDEO_404)).toBe(false);
    expect(isNotFoundVideo(apiError(412, 'The video is not associated to the shelter'))).toBe(false);
  });

  it('formatea el contador en singular y plural', () => {
    expect(formatVideoCount(0)).toBe('Mostrando 0 videos');
    expect(formatVideoCount(1)).toBe('Mostrando 1 video');
    expect(formatVideoCount(3)).toBe('Mostrando 3 videos');
  });
  
  it('antepone el motivo cuando no se puede eliminar (412)', () => {
    expect(
      getVideoDeleteErrorMessage(apiError(412, 'The video is not associated to the shelter')),
    ).toBe('No se puede eliminar el video: Este video pertenece a otro refugio.');
  });

  it('en otros errores de eliminación muestra el mensaje normal', () => {
    expect(getVideoDeleteErrorMessage(VIDEO_404)).toBe('Video no encontrado.');
    expect(getVideoDeleteErrorMessage({ request: {} })).toMatch(/conectar con el servidor/);
  });
});