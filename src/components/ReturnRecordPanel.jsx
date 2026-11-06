import ReturnEditPanel from './ReturnEditPanel';
import ReturnRecordDetails from './ReturnRecordDetails';
import ReturnRegisterPanel from './ReturnRegisterPanel';

export default function ReturnRecordPanel({ adoptionId, returnRecord, actions }) {
  if (!returnRecord) {
    return <ReturnRegisterPanel adoptionId={adoptionId} onSubmit={actions.register} />;
  }

  if (actions.editing) {
    return (
      <ReturnEditPanel
        returnRecord={returnRecord}
        onSubmit={actions.update}
        onCancel={actions.cancelEdit}
      />
    );
  }

  return (
    <ReturnRecordDetails
      returnRecord={returnRecord}
      deleting={actions.deleting}
      onEdit={actions.startEdit}
      onDelete={actions.remove}
    />
  );
}
