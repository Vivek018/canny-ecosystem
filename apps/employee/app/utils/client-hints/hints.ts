export function getHintsUtils(hints: Record<string, any>) {
  function getCookieValue(
    cookieString: string | null | undefined,
    name: string,
  ): string | null {
    const hint = hints[name];
    if (!hint) {
      throw new Error(
        `Unknown client hint: ${typeof name === "string" ? name : "Unknown"}`,
      );
    }
    const value = cookieString
      ?.split(";")
      ?.map((c: string) => c.trim())
      ?.find((c: string) => c.startsWith(`${hint.cookieName}=`))
      ?.split("=")[1];
    return value ? decodeURIComponent(value) : null;
  }
  function getHints(request: Request) {
    const cookieString =
      typeof document !== "undefined"
        ? document.cookie
        : typeof request !== "undefined"
          ? request.headers.get("cookie")
          : "";
    return Object.entries(hints).reduce(
      (acc: Record<string, string | number | boolean>, [name, hint]) => {
        const hintName = name;
        if ("transform" in hint) {
          acc[hintName] = hint.transform(
            getCookieValue(cookieString, hintName) ?? (hint.fallback as string),
          );
        }
        if ("transform" in hint) {
          acc[hintName] = hint.transform(
            getCookieValue(cookieString, hintName) ?? (hint.fallback as string),
          );
        } else {
          acc[hintName] =
            getCookieValue(cookieString, hintName) ?? hint.fallback;
        }
        return acc;
      },
      {},
    );
  }
  /**
   * This returns a string of JavaScript that can be used to check if the client
   * hints have changed and will reload the page if they have.
   */
  function getClientHintCheckScript() {
    return `
const cookies = document.cookie.split(';').map(c => c.trim()).reduce((acc, cur) => {
	const [key, value] = cur.split('=');
	acc[key] = value;
	return acc;
}, {});
let cookieChanged = false;
const hints = [
${Object.values(hints)
  .map((hint: any) => {
    const cookieName = JSON.stringify(hint.cookieName);
    return `{ name: ${cookieName}, actual: String(${hint.getValueCode}), value: cookies[${cookieName}] ?? encodeURIComponent("${hint.fallback}") }`;
  })
  .join(",\n")}
];
for (const hint of hints) {
	document.cookie = encodeURIComponent(hint.name) + '=' + encodeURIComponent(hint.actual) + '; Max-Age=31536000; path=/';
	if (decodeURIComponent(hint.value) !== hint.actual) {
		cookieChanged = true;
	}
}
// if the cookie changed, reload the page, unless the browser doesn't support
// cookies (in which case we would enter an infinite loop of reloads)
if (cookieChanged && navigator.cookieEnabled) {
	window.location.reload();
}
			`;
  }
  return { getHints, getClientHintCheckScript };
}
