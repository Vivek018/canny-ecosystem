export function invariant(condition: any, message: any) {
  if (!condition) {
    throw Error(typeof message === "function" ? message() : message);
  }
}
