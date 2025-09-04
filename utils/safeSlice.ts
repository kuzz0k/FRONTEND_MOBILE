export function safeSlice(obj: any) {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    const out: Record<string, any> = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (Array.isArray(v)) out[k] = v.slice(0,5);
      else if (v && typeof v === 'object') out[k] = '[object]';
      else out[k] = v;
    });
    return out;
  } catch {
    return '[unavailable]';
  }
}