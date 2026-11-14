import PetSectionBreadcrumb from './PetSectionBreadcrumb';

export default function VaccinationRecordBreadcrumb({ pet, current }) {
  return (
    <PetSectionBreadcrumb
      pet={pet}
      section="Carnet de vacunación"
      sectionPath="/carnet"
      current={current}
    />
  );
}