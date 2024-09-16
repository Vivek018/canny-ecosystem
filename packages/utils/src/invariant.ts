export function invariant(condition: any, message: any) {
  if (!condition) {
    throw new Error(typeof message === "function" ? message() : message);
  }
}
