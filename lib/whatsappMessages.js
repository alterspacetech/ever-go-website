import { money } from "./format.js";

const REF_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeOrderRef() {
  let ref = "EG-";
  for (let i = 0; i < 4; i++) ref += REF_LETTERS[Math.floor(Math.random() * REF_LETTERS.length)];
  return ref;
}

const sizeSuffix = (variant) => (variant.size !== "One size" ? ` (${variant.size})` : "");

export function bagOrderText({ ref, lines, itemsTotal, courierFee, details, courierName }) {
  let text = `Hello EVER-GO, I'd like to order:\nOrder ref: ${ref}\n\n`;
  lines.forEach((l) => {
    text += `• ${l.product.name}${sizeSuffix(l.variant)} x${l.qty} @ ${money(l.unit)}${l.unit < l.base ? " bulk" : ""} = ${money(l.unit * l.qty)}\n`;
  });
  if (courierFee != null) {
    text += `\nItems: ${money(itemsTotal)}\nCourier: ${money(courierFee)}\nTotal: ${money(itemsTotal + courierFee)}`;
  } else {
    text += `\nTotal: ${money(itemsTotal)} (plus courier)`;
  }
  text += `\n\nName: ${details.name.trim() || "-"}\nTown: ${details.town.trim() || "-"}\nPayment: ${details.pay}${courierName ? `\nDelivery: ${courierName}` : ""}`;
  if (details.note.trim()) text += `\nNote: ${details.note.trim()}`;
  return text;
}

export function buyNowText({ ref, product, variant, qty, unit }) {
  return `Hello EVER-GO, I'd like to order:\nOrder ref: ${ref}\n\n• ${product.name}${sizeSuffix(variant)} x${qty} @ ${money(unit)}${unit < variant.price ? " bulk" : ""} = ${money(unit * qty)}\n\nTotal: ${money(unit * qty)} (plus courier)\n\nName: \nTown: \nPayment: `;
}

export const notifyText = (product, variant) =>
  `Hello EVER-GO, please let me know when ${product.name}${variant ? sizeSuffix(variant) : ""} is back in stock.`;