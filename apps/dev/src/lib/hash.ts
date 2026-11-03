/** Hash FNV-1a a 32 bit in esadecimale: "commit" finti ma stabili da build a build. */
export const shortHash = (input: string, length = 7) => {
  let h = 0x811c9dc5
  for (const ch of input) {
    h ^= ch.codePointAt(0) ?? 0
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, length)
}
