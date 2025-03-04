export const clientHints = {
  cookieName: "CH-prefers-color-scheme",
  getValueCode: `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`,
  fallback: "light",
  transform(value: string) {
    return value === "dark" ? "dark" : "light";
  },
};

/**
 * Subscribe to changes in the user's color scheme preference. Optionally pass
 * in a cookie name to use for the cookie that will be set if different from the
 * default.
 */
export const subscribeToSchemeChange = (
  subscriber: (value: string) => void,
  cookieName = clientHints.cookieName,
) => {
  const schemaMatch = window.matchMedia("(prefers-color-scheme: dark)");
  function handleThemeChange() {
    const value = schemaMatch.matches ? "dark" : "light";
    document.cookie = `${cookieName}=${value}; Max-Age=31536000; Path=/`;
    subscriber(value);
  }
  schemaMatch.addEventListener("change", handleThemeChange);
  return function cleanupSchemaChange() {
    schemaMatch.removeEventListener("change", handleThemeChange);
  };
};
