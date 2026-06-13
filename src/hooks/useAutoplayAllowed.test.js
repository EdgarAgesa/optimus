import { decideAutoplay } from './useAutoplayAllowed';

// matchMedia is not implemented in jsdom — install a controllable mock.
function mockMatchMedia(matchFor = {}) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: !!matchFor[query],
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}
function setConnection(conn) {
  Object.defineProperty(navigator, 'connection', { value: conn, configurable: true });
}

const RM = '(prefers-reduced-motion: reduce)';
const DESKTOP = '(min-width: 1024px) and (pointer: fine)';

afterEach(() => {
  setConnection(undefined);
  delete window.matchMedia;
});

describe('decideAutoplay', () => {
  test('reduced motion -> poster', () => {
    mockMatchMedia({ [RM]: true, [DESKTOP]: true });
    setConnection({ effectiveType: '4g', saveData: false });
    expect(decideAutoplay()).toBe('poster');
  });
  test('saveData -> poster', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection({ effectiveType: '4g', saveData: true });
    expect(decideAutoplay()).toBe('poster');
  });
  test('3g -> poster', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection({ effectiveType: '3g', saveData: false });
    expect(decideAutoplay()).toBe('poster');
  });
  test('4g -> autoplay', () => {
    mockMatchMedia({});
    setConnection({ effectiveType: '4g', saveData: false });
    expect(decideAutoplay()).toBe('autoplay');
  });
  test('no connection API + desktop -> autoplay', () => {
    mockMatchMedia({ [DESKTOP]: true });
    setConnection(undefined);
    expect(decideAutoplay()).toBe('autoplay');
  });
  test('no connection API + narrow/touch -> poster', () => {
    mockMatchMedia({ [DESKTOP]: false });
    setConnection(undefined);
    expect(decideAutoplay()).toBe('poster');
  });
});
