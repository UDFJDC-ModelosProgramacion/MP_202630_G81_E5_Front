import { getLifeEventTypeVariant } from '../utils/lifeEventOptions';

export default function LifeEventTypeBadge({ type }) {
  return (
    <span className={`life-event-badge life-event-badge--${getLifeEventTypeVariant(type)}`}>
      {type}
    </span>
  );
}