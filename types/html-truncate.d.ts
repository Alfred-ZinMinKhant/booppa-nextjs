declare module 'html-truncate' {
  /**
   * Truncate an HTML string to the given length, preserving tag structure.
   * The real library accepts additional options; use `any` for flexibility.
   */
  const truncate: (html: string, length: number, options?: any) => string;
  export default truncate;
}
