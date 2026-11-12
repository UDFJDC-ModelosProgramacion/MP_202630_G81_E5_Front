import { describe, expect, it } from 'vitest';
import { buildPhotoTabs, describePhotoOwner, photosPath } from './photoOwners';

describe('photoOwners', () => {
  it('arma la ruta de fotos de una mascota y de un refugio', () => {
    expect(photosPath('pets', 7)).toBe('/mascotas/7/fotos');
    expect(photosPath('shelters', 2)).toBe('/refugios/2/fotos');
  });

  it('describe el destino de la foto', () => {
    expect(describePhotoOwner('pets', { name: 'Luna', species: 'Perro' })).toBe('Luna · Perro');
    expect(describePhotoOwner('shelters', { name: 'Huellitas' })).toBe('Huellitas · Refugio');
  });

  it('una mascota tiene la pestaña de mascota y la de su refugio', () => {
    expect(buildPhotoTabs('pets', { id: 1, shelter: { id: 2 } })).toEqual([
      { label: 'Fotos de la mascota', to: '/mascotas/1/fotos', active: true },
      { label: 'Fotos del refugio', to: '/refugios/2/fotos', active: false },
    ]);
  });

  it('una mascota sin refugio solo tiene su pestaña', () => {
    expect(buildPhotoTabs('pets', { id: 1, shelter: null })).toHaveLength(1);
  });

  it('un refugio solo tiene la pestaña de refugio', () => {
    expect(buildPhotoTabs('shelters', { id: 2 })).toEqual([
      { label: 'Fotos del refugio', to: '/refugios/2/fotos', active: true },
    ]);
  });
});