export const isAspireDomain = () =>
  window.location.hostname === "testingweleone-aspiri.vercel.app" ||
  window.location.hash.startsWith("#/aspire");
