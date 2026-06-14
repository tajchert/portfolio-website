export const SF_CHARSETS: Record<string, string> = {
  alpha: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:/!',
  num: ' 0123456789.,:-',
};

export function resolveCharset(attr: string): string {
  return SF_CHARSETS[attr] || attr;
}

export function normalize(str: string, len: number, align: string, charset: string): string {
  const blank = charset[0];
  const idx = new Set(charset.split(''));
  let s = (str == null ? '' : String(str)).toUpperCase();
  s = s.split('').map((c) => (idx.has(c) ? c : blank)).join('');
  if (s.length > len) s = s.slice(0, len);
  const pad = len - s.length;
  if (pad > 0) {
    if (align === 'right') s = blank.repeat(pad) + s;
    else if (align === 'left') s = s + blank.repeat(pad);
    else { const l = Math.floor(pad / 2); s = blank.repeat(l) + s + blank.repeat(pad - l); }
  }
  return s;
}
