import { describe, expect, it } from 'vitest';
import { HOME_MODULES } from './homeModules';

describe('HOME_MODULES', () => {
  it('define título, descripción y ruta para cada módulo', () => {
    HOME_MODULES.forEach((module) => {
      expect(module.title).toBeTruthy();
      expect(module.description).toBeTruthy();
      expect(module.to.startsWith('/')).toBe(true);
    });
  });

  it('no repite rutas', () => {
    const routes = HOME_MODULES.map((module) => module.to);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('incluye las secciones principales', () => {
    const routes = HOME_MODULES.map((module) => module.to);
    expect(routes).toEqual(expect.arrayContaining(['/mascotas', '/adopciones', '/adoptantes', '/refugios']));
  });
});