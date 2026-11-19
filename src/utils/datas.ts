import type { DataApi } from '../model/Ocorrencia';

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/**
 * Lê o LocalDateTime da API como horário local.
 * Aceita "2026-11-19T14:00:00", "2026-11-19T14:00:00.123" e o formato array [2026, 11, 19, 14, 0].
 */
export function lerDataApi(valor: DataApi | null | undefined): Date | null {
  if (valor == null) return null;
  if (Array.isArray(valor)) {
    const [ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = valor;
    if (!ano || !mes || !dia) return null;
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  }
  const partes = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(valor);
  if (!partes) return null;
  const [, ano, mes, dia, hora, minuto, segundo] = partes;
  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo ?? 0),
  );
}

/** Date → "19/11/2026 14:00" */
export function dataParaTexto(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()} ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

/** Valor da API → "19/11/2026 14:00" (ou "—"). */
export function formatarDataApi(valor: DataApi | null | undefined): string {
  const data = lerDataApi(valor);
  return data ? dataParaTexto(data) : '—';
}

/** "19/11/2026 14:00" → Date, ou null se a data não existir. */
export function textoParaData(texto: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(texto.trim());
  if (!partes) return null;
  const [dia, mes, ano, hora, minuto] = partes.slice(1).map(Number);
  if (hora > 23 || minuto > 59) return null;
  const data = new Date(ano, mes - 1, dia, hora, minuto, 0);
  if (data.getDate() !== dia || data.getMonth() !== mes - 1) return null;
  return data;
}

/** Date → "2026-11-19T14:00:00" (LocalDateTime esperado pela API, sem fuso). */
export function dataParaApi(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:00`;
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
