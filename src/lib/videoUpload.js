// Pure upload size guards. Bandwidth-first: the poster is the asset constrained
// (mobile-data) users actually download, so it is capped too — not just the video.
const MB = 1024 * 1024;

const LIMITS = {
  video:  { warn: 10 * MB, block: 25 * MB, noun: 'Video',  max: '25 MB', warnAt: '10 MB' },
  poster: { warn: 0.5 * MB, block: 1 * MB, noun: 'Poster', max: '1 MB',  warnAt: '500 KB' },
};

const fmt = (bytes) =>
  bytes >= 2 * MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

function validate(file, kind) {
  const L = LIMITS[kind];
  if (!file) return { ok: false, level: 'block', message: 'No file selected.' };
  if (file.size > L.block) {
    return { ok: false, level: 'block',
      message: `${L.noun} is ${fmt(file.size)}. Max is ${L.max} — please compress it before uploading.` };
  }
  if (file.size > L.warn) {
    return { ok: true, level: 'warn',
      message: `${L.noun} is ${fmt(file.size)}. Over ${L.warnAt} is heavy on mobile data — consider a smaller file.` };
  }
  return { ok: true, level: 'ok', message: '' };
}

export const validateVideoFile = (file) => validate(file, 'video');
export const validatePosterFile = (file) => validate(file, 'poster');
