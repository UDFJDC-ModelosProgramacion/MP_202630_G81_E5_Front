import { useState } from 'react';
import { getVideoEmbed } from '../utils/videoUrl';

export default function VideoPlayer({ url }) {
  const [failed, setFailed] = useState(false);
  const embed = getVideoEmbed(url);

  if (!embed) return null;

  if (embed.type === 'youtube') {
    return (
      <div className="video-player video-player--embed">
        <iframe
          src={embed.src}
          title="Reproductor del video"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <>
      <video
        className="video-player"
        src={embed.src}
        controls
        preload="metadata"
        aria-label="Reproductor del video"
        onError={() => setFailed(true)}
      >
        Tu navegador no puede reproducir este video.
      </video>
      {failed && (
        <p className="video-player__error" role="status">
          No se pudo reproducir el video. Prueba con el botón "Abrir video".
        </p>
      )}
    </>
  );
}