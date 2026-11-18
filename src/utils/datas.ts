const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** "2026-11-17T14:00:00" → "17/11/2026 14:00" */
export function formatarDataHora(iso?: string | null): string {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()} ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

/** "17/11/2026 14:00" → "2026-11-17T14:00:00" (formato LocalDateTime da API) ou null. */
export function paraDataApi(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const [, dd, mm, aaaa, hh, min] = m.map(Number);
  const data = new Date(aaaa, mm - 1, dd, hh, min);
  if (data.getDate() !== dd || data.getMonth() !== mm - 1 || hh > 23 || min > 59) return null;
  return `${aaaa}-${doisDigitos(mm)}-${doisDigitos(dd)}T${doisDigitos(hh)}:${doisDigitos(min)}:00`;
}

export function agoraFormatado(): string {
  return formatarDataHora(new Date().toISOString());
}

/** Máscara DD/MM/AAAA HH:mm enquanto o usuário digita. */
export function mascaraDataHora(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 12);
  let r = d.slice(0, 2);
  if (d.length > 2) r += `/${d.slice(2, 4)}`;
  if (d.length > 4) r += `/${d.slice(4, 8)}`;
  if (d.length > 8) r += ` ${d.slice(8, 10)}`;
  if (d.length > 10) r += `:${d.slice(10, 12)}`;
  return r;
}
