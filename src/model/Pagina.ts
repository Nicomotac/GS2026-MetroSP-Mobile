/** Formato Page do Spring Data retornado pelas listagens. */
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}
