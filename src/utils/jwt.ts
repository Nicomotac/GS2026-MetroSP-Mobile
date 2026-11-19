const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decodifica base64url sem depender de atob/Buffer. */
function base64UrlParaTexto(parte: string): string {
  const limpo = parte.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let acumulador = 0;
  let bits = 0;
  let hex = '';
  for (const caractere of limpo) {
    const valor = ALFABETO.indexOf(caractere);
    if (valor < 0) throw new Error('Token em formato inválido');
    acumulador = ((acumulador << 6) | valor) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      hex += `%${((acumulador >> bits) & 0xff).toString(16).padStart(2, '0')}`;
    }
  }
  return decodeURIComponent(hex);
}

export interface DadosJwt {
  sub?: string;
  exp?: number;
  perfil?: string;
}

/** Lê o payload do JWT emitido pela API (não valida assinatura: isso é papel da API). */
export function lerJwt(token: string): DadosJwt | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(base64UrlParaTexto(payload)) as DadosJwt;
  } catch {
    return null;
  }
}
