import type { CacheStore } from '../../application/interfaces/CacheStore.js';

export class InMemoryCacheStore implements CacheStore {
  //cria um array onde a chave e string e o valor dela e um obj
  private readonly dados = new Map<string, { valor: string; expiraEm: number | null }>();
  public falhando = false; //simula Redis fora do ar
  public acessos = { obter: 0, guardar: 0, remover: 0 };

  constructor(private readonly agora: () => number = Date.now) {}

  async obter(chave: string): Promise<string | null> {
    this.acessos.obter++;
    if (this.falhando) return null;
    const e = this.dados.get(chave);
    if (!e) return null;
    if (e.expiraEm !== null && e.expiraEm <= this.agora()) {
      this.dados.delete(chave);
      return null;
    }
    return e.valor;
  }

  async guardar(chave: string, valor: string, ttlSegundos: number): Promise<void> {
    this.acessos.guardar++;
    if (this.falhando) return;
    this.dados.set(chave, { valor, expiraEm: this.agora() + ttlSegundos * 1000 });
  }

  async remover(...chaves: string[]): Promise<void> {
    this.acessos.remover++;
    if (this.falhando) return;
    chaves.forEach((c) => this.dados.delete(c));
  }

  async incrementar(chave: string): Promise<number> {
    const atual = Number(this.dados.get(chave)?.valor ?? 0) + 1;
    if (this.falhando) return Date.now();
    this.dados.set(chave, { valor: String(atual), expiraEm: null });
    return atual;
  }

  tem(chave: string): boolean {
    return this.dados.has(chave);
  }
}