import 'dotenv/config';
import { Redis } from 'ioredis';

export function criarRedis(url = process.env.REDIS_URL): Redis {
  if (!url) throw new Error('REDIS_URL não definida');

  const redis = new Redis(url, {
    maxRetriesPerRequest: 1,       //não deixa requisição pendurada se Redis cair
    enableOfflineQueue: false,     //sem conexão, falha na hora (em vez de enfileirar)
    connectTimeout: 2_000,
    retryStrategy: (tentativa) => Math.min(tentativa * 200, 2_000), //reconecta com espera crescente
  });

  //on('error')sem ele, um erro de conexão vira exceção não tratada e derruba o processo.
  redis.on('error', (e) => console.error('[redis] erro:', e.message));
  redis.on('reconnecting', () => console.warn('[redis] reconectando...'));
  return redis;
}