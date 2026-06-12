// WhatsApp order message — the checkout revenue path (spec D9: unit-tested).
// Logic lifted verbatim from the original CartDrawer.buildWaMessage.
export function buildWaMessage(cart, cartTotal, formatPrice) {
  let msg = `Hi! I'd like to order:\n\n`;
  cart.forEach((item, i) => {
    const price = parseInt(item.price.replace(/\D/g, ''));
    msg += `${i + 1}. ${item.name}\n   Qty: ${item.qty} × ${item.price} = ${formatPrice(price * item.qty)}\n\n`;
  });
  msg += `*Total: ${formatPrice(cartTotal)}*\n\nPlease confirm availability. Thanks!`;
  return encodeURIComponent(msg);
}
