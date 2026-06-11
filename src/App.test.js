import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: the storefront renders its navbar wordmark.
// (Replaced the stock CRA "learn react" test, which never matched this app.)
test('renders the OPTIMUS storefront shell', () => {
  render(<App />);
  expect(screen.getAllByText(/OPTIMUS/i).length).toBeGreaterThan(0);
});
