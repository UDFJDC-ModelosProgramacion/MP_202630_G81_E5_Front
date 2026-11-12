import { useState } from 'react';

export default function PhotoImage({ url, label, alt, large = false }) {
  const [failed, setFailed] = useState(false);
  const size = large ? ' photo-large' : '';

  if (failed || !url) {
    return <div className={`photo-placeholder${size}`}>{label}</div>;
  }
  return (
    <img
      src={url}
      alt={alt}
      className={`photo-image${size}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}