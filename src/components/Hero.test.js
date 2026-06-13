import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
});

test('no cache + active promo -> swaps in PromoHero with fade', async () => {
  results.promo_video = { data: { id: '1', title: 'X', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' } };
  render(<MemoryRouter><Hero /></MemoryRouter>);
  const el = await screen.findByTestId('promo-hero');
  expect(el.getAttribute('data-fadein')).toBe('true');
});

test('cached promo -> renders PromoHero on first paint, no fade', () => {
  const cached = { id: 'c', title: 'Cached', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' };
  localStorage.setItem('optimus-promo', JSON.stringify(cached));
  results.promo_video = { data: cached };
  render(<MemoryRouter><Hero /></MemoryRouter>);
  const el = screen.getByTestId('promo-hero'); // present synchronously on first render
  expect(el).toBeInTheDocument();
  expect(el.getAttribute('data-fadein')).toBe('false');
});
