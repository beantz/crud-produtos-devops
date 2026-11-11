import type { Redis } from 'ioredis';
import type { CacheStore } from '../../application/interfaces/CacheStore.js';

export class RedisCacheStore implements CacheStore {
  constructor(private readonly redis: Redis) {}

  //tenta buscar o dado no redis
  async obter(chave: string): Promise<string | null> {
    //try catch:se der erro, eles não quebram a aplicação, eles engolem o erro.
    try {
      return await this.redis.get(chave);
    } catch {
      return null; //fail-open: tratado como "não achei no cache"
    }
  }

  //tenta guardar no redis
  //ttl -> por quanto tempo o dado vai existir ate ser apagado
  async guardar(chave: string, valor: string, ttlSegundos: number): Promise<void> {
    try {
      await this.redis.set(chave, valor, 'EX', ttlSegundos);
    } catch {}
  }

  //aceita varias chaves, se nao achar fica como ta
  async remover(...chaves: string[]): Promise<void> {
    if (chaves.length === 0) return;
    try {
      await this.redis.del(...chaves);
    } catch {}
  }

  //redis processar um comando de cada vez, mesmo q sejam muitos ao mesmo tempo
  async incrementar(chave: string): Promise<number> {
    try {
      return await this.redis.incr(chave);
    } catch {
      return Date.now();
    }
  }
}