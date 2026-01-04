export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";
  const lower = ua.toLowerCase();

  const isInstagram = ua.includes("Instagram");
  const isFacebook = ua.includes("FBAN") || ua.includes("FBAV");
  const isMessenger = ua.includes("Messenger");
  const isLine = lower.includes(" line/");
  const isLinkedIn = ua.includes("LinkedIn") || lower.includes("linkedin");

  return isInstagram || isFacebook || isMessenger || isLine || isLinkedIn;
}
