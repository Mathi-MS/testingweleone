export const isAspireDomain = () =>
  window.location.hostname === "aspire.wele.in" ||
  window.location.hash.startsWith("#/aspire");
