export const SITE_NAME = "Tawau Homestay";

export const OWNER_WHATSAPP = "60123456789";

export function waLink(homestayName?: string): string {
  const message = homestayName
    ? `Hi, I'm interested in your homestay "${homestayName}". Is it available?`
    : "Hi, I'd like to ask about your homestays in Tawau.";
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number): string {
  return `RM ${price.toLocaleString("en-MY")} / night`;
}

export function ratingLabel(rating: number): string {
  if (rating >= 4.8) return "Exceptional";
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  return "Average";
}
