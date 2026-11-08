const FILE_EXTENSIONS = /\.(mp4|webm|ogg|ogv)$/i;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const YOUTUBE_ID = /^[\w-]{11}$/;

// Solo se enlazan URLs http(s); evita esquemas como javascript: en el href.
export function isHttpUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function getYoutubeId(url) {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1);
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const [, kind, id] = url.pathname.split('/');
  return kind === 'embed' || kind === 'shorts' ? id : null;
}

// Devuelve cómo reproducir la URL dentro de la página, o null si solo se puede enlazar.
export function getVideoEmbed(value) {
  if (!isHttpUrl(value)) return null;
  const url = new URL(value);

  if (YOUTUBE_HOSTS.has(url.hostname)) {
    const id = getYoutubeId(url);
    return YOUTUBE_ID.test(id ?? '')
      ? { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` }
      : null;
  }
  return FILE_EXTENSIONS.test(url.pathname) ? { type: 'file', src: value } : null;
}