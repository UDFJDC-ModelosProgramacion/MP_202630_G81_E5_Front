import { describe, expect, it } from 'vitest';
import {buildShelterOptions,buildVideoPayload,EMPTY_VIDEO_FORM,videoToFormValues,} from './videoMapper';

describe('videoMapper', () => {
  it('el formulario vacío no tiene URL', () => {
    expect(EMPTY_VIDEO_FORM).toEqual({ url: '' });
  });

  it('videoToFormValues carga la URL del video', () => {
    expect(videoToFormValues({ id: 1, url: 'https://v.co/a.mp4' })).toEqual({
      url: 'https://v.co/a.mp4',
    });
  });

  it('videoToFormValues usa texto vacío si no hay URL', () => {
    expect(videoToFormValues({ id: 1, url: null })).toEqual({ url: '' });
  });

  it('buildVideoPayload recorta la URL y no envía el refugio', () => {
    expect(buildVideoPayload({ url: '  https://v.co/a.mp4  ', target: 'x' })).toEqual({
      url: 'https://v.co/a.mp4',
    });
  });
  
  it('buildShelterOptions convierte los refugios en opciones del select', () => {
    const shelters = [{ id: 7, name: 'Huellitas' }, { id: 8, name: 'Patitas' }];
    expect(buildShelterOptions(shelters, 7, 'Huellitas')).toEqual([
      { value: '7', label: 'Huellitas' },
      { value: '8', label: 'Patitas' },
    ]);
  });

  it('buildShelterOptions agrega el refugio actual si no está en la lista', () => {
    expect(buildShelterOptions([], '7', 'Huellitas')).toEqual([{ value: '7', label: 'Huellitas' }]);
    expect(buildShelterOptions([{ id: 8, name: 'Patitas' }], 7, undefined)[0]).toEqual({
      value: '7',
      label: 'Refugio 7',
    });
  });
});