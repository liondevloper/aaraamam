export function errMsg(e: unknown, fallback = 'Something went wrong'): string {
  return e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' ? e.message : fallback;
}
