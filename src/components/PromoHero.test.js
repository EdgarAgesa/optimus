import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PromoHero from './PromoHero';

// Control the gate.
jest.mock('../hooks/useAutoplayAllowed');
import useAutoplayAllowed from '../hooks/useAutoplayAllowed';

// Stub useProducts so the linked product resolves.
jest.mock('../hooks/useProducts', () => ({
  useProducts: () => ({ products: [{ sku: 'WA0091', img: '/p.jpg' }], loading: false }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const promo = {
  id: '1', video_url: '/v.mp4', poster_url: '/poster.jpg',
  title: 'Elden Ring', caption: "This week's best seller",
  cta_label: 'Shop This Game', product_sku: 'WA0091',
};

const renderHero = () => render(<MemoryRouter><PromoHero promo={promo} /></MemoryRouter>);

beforeEach(() => {
  mockNavigate.mockReset();
  // jsdom has no real media engine.
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue();
});

test('poster mode: shows poster + play button, no video src until tap', () => {
  useAutoplayAllowed.mockReturnValue('poster');
  const { container } = renderHero();
  expect(screen.getByRole('button', { name: /watch/i })).toBeInTheDocument();
  expect(container.querySelector('video')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /watch/i }));
  expect(container.querySelector('video')).not.toBeNull();
});

test('autoplay mode: video has preload=none, poster attr, and plays', () => {
  useAutoplayAllowed.mockReturnValue('autoplay');
  const { container } = renderHero();
  const video = container.querySelector('video');
  expect(video).not.toBeNull();
  expect(video.getAttribute('preload')).toBe('none');
  expect(video.getAttribute('poster')).toBe('/poster.jpg');
  expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
});

test('autoplay rejection falls back to poster + play button', async () => {
  useAutoplayAllowed.mockReturnValue('autoplay');
  window.HTMLMediaElement.prototype.play = jest.fn().mockRejectedValue(new Error('blocked'));
  renderHero();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /watch/i })).toBeInTheDocument()
  );
});

test('CTA navigates to the linked product page', () => {
  useAutoplayAllowed.mockReturnValue('poster');
  renderHero();
  fireEvent.click(screen.getByRole('button', { name: /shop this game/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/product/WA0091');
});
