import { validateVideoFile, validatePosterFile } from './videoUpload';

const MB = 1024 * 1024;
const fileOf = (bytes) => ({ name: 'x', size: bytes });

describe('validateVideoFile', () => {
  test('blocks above 25 MB', () => {
    const r = validateVideoFile(fileOf(26 * MB));
    expect(r.ok).toBe(false);
    expect(r.level).toBe('block');
    expect(r.message).toMatch(/25 MB/);
  });
  test('warns between 10 and 25 MB', () => {
    const r = validateVideoFile(fileOf(12 * MB));
    expect(r.ok).toBe(true);
    expect(r.level).toBe('warn');
  });
  test('ok below 10 MB', () => {
    expect(validateVideoFile(fileOf(5 * MB))).toEqual({ ok: true, level: 'ok', message: '' });
  });
  test('blocks when no file', () => {
    expect(validateVideoFile(null).ok).toBe(false);
  });
});

describe('validatePosterFile', () => {
  test('blocks above 1 MB', () => {
    const r = validatePosterFile(fileOf(1.5 * MB));
    expect(r.ok).toBe(false);
    expect(r.level).toBe('block');
    expect(r.message).toMatch(/1 MB/);
  });
  test('warns between 500 KB and 1 MB', () => {
    const r = validatePosterFile(fileOf(0.7 * MB));
    expect(r.ok).toBe(true);
    expect(r.level).toBe('warn');
  });
  test('ok below 500 KB', () => {
    expect(validatePosterFile(fileOf(0.3 * MB))).toEqual({ ok: true, level: 'ok', message: '' });
  });
});
