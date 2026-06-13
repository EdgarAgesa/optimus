import { handleFileDrop } from './fileDrop';
import { validateVideoFile, validatePosterFile } from './videoUpload';

const dropEvent = (file) => ({
  preventDefault: jest.fn(),
  dataTransfer: { files: file ? [file] : [] },
});

test('feeds the dropped file to the handler and the video validator runs (same block path as click-select)', () => {
  const seen = [];
  const onFile = (f) => seen.push(validateVideoFile(f)); // mirrors onSelectPromoVideo
  const e = dropEvent({ name: 'big.mp4', size: 26 * 1024 * 1024 });
  handleFileDrop(e, onFile);
  expect(e.preventDefault).toHaveBeenCalled();
  expect(seen).toHaveLength(1);
  expect(seen[0].level).toBe('block'); // 26 MB -> blocked, identical to selection
});

test('a valid dropped poster passes the poster validator', () => {
  const seen = [];
  const onFile = (f) => seen.push(validatePosterFile(f));
  const e = dropEvent({ name: 'poster.jpg', size: 300 * 1024 });
  handleFileDrop(e, onFile);
  expect(seen[0]).toEqual({ ok: true, level: 'ok', message: '' });
});

test('re-dropping always re-fires the handler (no stale-value gotcha)', () => {
  const onFile = jest.fn();
  const file = { name: 'x.mp4', size: 100 };
  handleFileDrop(dropEvent(file), onFile);
  handleFileDrop(dropEvent(file), onFile); // same file again
  expect(onFile).toHaveBeenCalledTimes(2);
});

test('does nothing (but prevents default) when no file is dropped', () => {
  const onFile = jest.fn();
  const e = dropEvent(null);
  handleFileDrop(e, onFile);
  expect(e.preventDefault).toHaveBeenCalled();
  expect(onFile).not.toHaveBeenCalled();
});
