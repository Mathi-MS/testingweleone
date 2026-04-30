export const isAspireDomain = () =>
  window.location.hostname === "testingweleone.vercel.app" ||
  window.location.hash.startsWith("#/aspire");
