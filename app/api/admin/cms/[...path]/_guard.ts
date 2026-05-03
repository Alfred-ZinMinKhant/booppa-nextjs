export function verify_admin_token_present(token: string | undefined): boolean {
  return !!(token && token.length > 10)
}
