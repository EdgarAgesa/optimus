import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock PromoHero so we only assert which branch renders.
jest.mock('./PromoHero', () => (props) => <div data-testid="promo-hero" data-fadein={String(!!props.fadeIn)} />);

// Chainable supabase mock dispatched by table name.
const results = { promo_video: { data: null }, hero_slides: { data: [] }, products: { data: [] } };
jest.mock('../supabase', () => {
  const makeChain = (table) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      neq: () => chain,
      limit: () => chain,
      order: () => Promise.resolve(results[table] || { data: [] }),
      maybeSingle: () => Promise.resolve(results[table] || { data: null }),
    };
    return chain;
  };
  return { supabase: { from: (t) => makeChain(t) } };
});

import Hero from './Hero';

const renderHero = () => render(<MemoryRouter><Hero /></MemoryRouter>);

beforeEach(() => {
  results.promo_video = { data: null };
  results.hero_slides = { data: [] };
  localStorage.clear();
});

test('no active promo -> renders the carousel, not PromoHero', async () => {
  renderHero();
  await waitFor(() => expect(screen.queryByTestId('promo-hero')).toBeNull());
  // Carousel hallmark: the NN / NN slide counter exists.
  expect(screen.getByText('/', { exact: false })).toBeInTheDocument();
  await act(async () => {}); // flush pending fetch state to silence act() warnings
});

test('no cache + active promo -> swaps in PromoHero with fade', async () => {
  results.promo_video = { data: { id: '1', title: 'X', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' } };
  render(<MemoryRouter><Hero /></MemoryRouter>);
  const el = await screen.findByTestId('promo-hero');
  expect(el.getAttribute('data-fadein')).toBe('true');
  await act(async () => {}); // flush pending fetch state to silence act() warnings
});

test('cached promo -> renders PromoHero on first paint, no fade', async () => {
  const cached = { id: 'c', title: 'Cached', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' };
  localStorage.setItem('optimus-promo', JSON.stringify(cached));
  results.promo_video = { data: cached };
  render(<MemoryRouter><Hero /></MemoryRouter>);
  const el = screen.getByTestId('promo-hero'); // present synchronously on first render
  expect(el).toBeInTheDocument();
  expect(el.getAttribute('data-fadein')).toBe('false');
  await act(async () => {}); // flush pending fetch state to silence act() warnings
});

const makeSlides = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1, title: `Hero ${i + 1}`, subtitle: 's', price: 'KSh 1',
    category_slug: 'gaming', image: `/img${i + 1}.jpg`, sort_order: i + 1,
  }));

test('carousel renders one dot per slide for 5 slides', async () => {
  results.hero_slides = { data: makeSlides(5) };
  renderHero();
  await waitFor(() =>
    expect(screen.getAllByRole('button', { name: /^Slide \d/ }).length).toBe(5)
  );
  await act(async () => {});
});

test('lazy-warming: only the first two slide images mount initially with 5 slides', async () => {
  results.hero_slides = { data: makeSlides(5) };
  const { container } = renderHero();
  await waitFor(() =>
    expect(screen.getAllByRole('button', { name: /^Slide \d/ }).length).toBe(5)
  );
  // D6 lazy discipline: warmed starts {0,1}, so only 2 images are mounted up front
  // even with 5 slides — the rest warm in as the carousel rotates.
  expect(container.querySelectorAll('img').length).toBe(2);
  await act(async () => {});
});
