import { describe, expect, it } from 'vitest';
import { getVideoEmbed, isHttpUrl } from './videoUrl';

describe('isHttpUrl', () => {
  it.each([['https://videos.adoptaya.co/a.mp4'], ['http://localhost:8080/a.mp4']])(
    'acepta %s',
    (url) => expect(isHttpUrl(url)).toBe(true),
  );

  it.each([['javascript:alert(1)'], ['ftp://v.co/a.mp4'], ['no es una url'], [''], [null], [undefined]])(
    'rechaza %j',
    (url) => expect(isHttpUrl(url)).toBe(false),
  );
});

describe('getVideoEmbed', () => {
  it.each([
    ['https://videos.adoptaya.co/a.mp4'],
    ['https://videos.adoptaya.co/a.webm'],
    ['https://videos.adoptaya.co/a.OGG'],
    ['https://videos.adoptaya.co/a.mp4?token=1'],
  ])('reproduce %s como archivo de video', (url) => {
    expect(getVideoEmbed(url)).toEqual({ type: 'file', src: url });
  });

  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
  ])('incrusta %s desde YouTube', (url) => {
    expect(getVideoEmbed(url)).toEqual({
      type: 'youtube',
      src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    });
  });

  it.each([
    ['https://www.youtube.com/watch?v=corto'],
    ['https://www.youtube.com/'],
    ['https://www.youtube.com/channel/abc'],
    ['https://example.com/pagina'],
    ['javascript:alert(1)'],
    ['ftp://v.co/a.mp4'],
    [null],
    [undefined],
  ])('no reproduce %j', (url) => {
    expect(getVideoEmbed(url)).toBeNull();
  });
});