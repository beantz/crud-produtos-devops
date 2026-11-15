import { performance } from 'node:perf_hooks';
import { criarPool } from '../src/infra/database/pool.js';
import { criarRedis } from '../src/infra/cache/redisClient.js';
import { RedisCacheStore } from '../src/infra/cache/RedisCacheStore.js';
import { PostgresProdutoRepository } from '../src/infra/repositories/PostgresProdutoRepository.js';
import { CachedProdutoRepository } from '../src/infra/cache/CachedProdutoRepository.js';

const REQUISICOES = 2_000;

async function medir(nome: string, fn: () => Promise<unknown>) {
  for (let i = 0; i < 50; i++) await fn(); //aquecimento

  const tempos: number[] = [];
  for (let i = 0; i < REQUISICOES; i++) {
    const t0 = performance.now(); //guarda o tempo exato de cada uma
    await fn();
    tempos.push(performance.now() - t0);
  }
  tempos.sort((a, b) => a - b);

  const pct = (p: number) => tempos[Math.floor(tempos.length * p)].toFixed(3);
  const media = (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(3);
  console.log(`${nome.padEnd(28)} média ${media}ms | p50 ${pct(0.5)}ms | p95 ${pct(0.95)}ms | p99 ${pct(0.99)}ms`);
}

async function main() {
  const pool = criarPool();
  const redis = criarRedis();
  const semCache = new PostgresProdutoRepository(pool);
  const comCache = new CachedProdutoRepository(semCache, new RedisCacheStore(redis), {
    ttlProdutoSegundos: 3600,
    ttlListaSegundos: 3600,
  });

  await redis.flushdb(); //ATENÇÃO: use um db dedicado ao benchmark

  const id = (await semCache.buscarPaginado({ limite: 1, deslocamento: 0 })).itens[0]?.id;
  if (!id) throw new Error('Rode o seed antes (banco vazio)');
  const filtro = { limite: 20, deslocamento: 0 };

  console.log(`\n${REQUISICOES} requisições por cenário\n`);
  await medir('buscarPorId  SEM cache', () => semCache.buscarPorId(id));
  await medir('buscarPorId  COM cache', () => comCache.buscarPorId(id));
  await medir('buscarPaginado SEM cache', () => semCache.buscarPaginado(filtro));
  await medir('buscarPaginado COM cache', () => comCache.buscarPaginado(filtro));

  await pool.end();
  await redis.quit();
}

main().catch((e) => { console.error(e); process.exit(1); });