import FormField from './FormField';

export default function LockedPetField({ pet }) {
  const summary = [pet.name, pet.species].filter(Boolean).join(' · ');

  return (
    <FormField id="petId" label="Mascota">
      <select id="petId" className="form-control-brand" value={pet.id} disabled>
        <option value={pet.id}>{summary}</option>
      </select>
    </FormField>
  );
}