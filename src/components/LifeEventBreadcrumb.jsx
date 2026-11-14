import PetSectionBreadcrumb from './PetSectionBreadcrumb';

export default function LifeEventBreadcrumb({ pet, current }) {
  return (
    <PetSectionBreadcrumb
      pet={pet}
      section="Eventos de vida"
      sectionPath="/eventos-de-vida"
      current={current}
    />
  );
}