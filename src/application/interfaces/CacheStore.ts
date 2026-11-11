export interface CacheStore {
  obter(chave: string): Promise<string | null>;
  guardar(chave: string, valor: string, ttlSegundos: number): Promise<void>;
  remover(...chaves: string[]): Promise<void>;
  incrementar(chave: string): Promise<number>;
}