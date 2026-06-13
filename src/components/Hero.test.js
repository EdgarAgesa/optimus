import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock PromoHero so we only assert which branch renders.
jest.mock('./PromoHero', () => () => <div data-testid="promo-hero" />);

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
});

test('no active promo -> renders the carousel, not PromoHero', async () => {
  renderHero();
  await waitFor(() => expect(screen.queryByTestId('promo-hero')).toBeNull());
  // Carousel hallmark: the NN / NN slide counter exists.
  expect(screen.getByText('/', { exact: false })).toBeInTheDocument();
});

test('active promo -> renders PromoHero', async () => {
  results.promo_video = { data: { id: '1', title: 'X', video_url: '/v.mp4', poster_url: '/p.jpg', product_sku: 'S1' } };
  renderHero();
  await waitFor(() => expect(screen.getByTestId('promo-hero')).toBeInTheDocument());
});
