import { buildWaMessage } from './waMessage';

// Mirrors CartContext's formatPrice exactly (src/context/CartContext.js:102)
const formatPrice = (n) => `KSh ${n.toLocaleString()}`;

test('buildWaMessage produces the exact order message for a known cart', () => {
  const cart = [
    { sku: 'PS5-1', name: 'PS5 Slim 1TB', price: 'KSh 64,999', qty: 2 },
    { sku: 'XM5', name: 'Sony WH-1000XM5', price: 'KSh 38,500', qty: 1 },
  ];
  const cartTotal = 64999 * 2 + 38500; // 168,498

  const encoded = buildWaMessage(cart, cartTotal, formatPrice);
  const decoded = decodeURIComponent(encoded);

  expect(decoded).toBe(
    `Hi! I'd like to order:\n\n` +
    `1. PS5 Slim 1TB\n   Qty: 2 × KSh 64,999 = ${formatPrice(129998)}\n\n` +
    `2. Sony WH-1000XM5\n   Qty: 1 × KSh 38,500 = ${formatPrice(38500)}\n\n` +
    `*Total: ${formatPrice(168498)}*\n\nPlease confirm availability. Thanks!`
  );
});

test('buildWaMessage handles an empty cart without crashing', () => {
  const decoded = decodeURIComponent(buildWaMessage([], 0, formatPrice));
  expect(decoded).toContain(`Hi! I'd like to order:`);
  expect(decoded).toContain(`*Total: ${formatPrice(0)}*`);
});

// Edgar's ruling: deep-coverage case — 3 line items, mixed quantities incl. >1,
// six-figure comma totals; exercises the loop ordering and toLocaleString formatting.
test('buildWaMessage formats a 3-item mixed-quantity cart with six-figure totals', () => {
  const cart = [
    { sku: 'TV1', name: 'TCL 55" QLED', price: 'KSh 58,000', qty: 3 },
    { sku: 'PS5-1', name: 'PS5 Slim 1TB', price: 'KSh 64,999', qty: 1 },
    { sku: 'EB1', name: 'Oraimo FreePods', price: 'KSh 2,500', qty: 2 },
  ];
  const cartTotal = 58000 * 3 + 64999 + 2500 * 2; // 243,999
  const decoded = decodeURIComponent(buildWaMessage(cart, cartTotal, formatPrice));

  expect(decoded).toContain(`1. TCL 55" QLED\n   Qty: 3 × KSh 58,000 = ${formatPrice(174000)}`);
  expect(decoded).toContain(`2. PS5 Slim 1TB\n   Qty: 1 × KSh 64,999 = ${formatPrice(64999)}`);
  expect(decoded).toContain(`3. Oraimo FreePods\n   Qty: 2 × KSh 2,500 = ${formatPrice(5000)}`);
  expect(decoded).toContain(`*Total: ${formatPrice(243999)}*`);
});
