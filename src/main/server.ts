import 'dotenv/config'; //carrega as variaveis de amb 
import { criarPool } from '../infra/database/pool.js';
import { PostgresProdutoRepository } from '../infra/repositories/PostgresProdutoRepository.js';
import { UuidGenerator } from '../infra/id/UuidGenerator.js';
import { criarProdutoController } from './factories/criarContainer.js';
import { criarApp } from '../infra/http/app.js';
import { criarRedis } from '../infra/cache/redisClient.js';
import { RedisCacheStore } from '../infra/cache/RedisCacheStore.js';
import { CachedProdutoRepository } from '../infra/cache/CachedProdutoRepository.js';

const pool = criarPool();
const redis = criarRedis();
const repoPostgres = new PostgresProdutoRepository(pool);

const cache = new RedisCacheStore(redis);
const repo = new CachedProdutoRepository(repoPostgres, cache, {
  ttlProdutoSegundos: Number(process.env.CACHE_TTL_SEGUNDOS ?? 60),
});

const app = criarApp({ produtoController: criarProdutoController(repo, new UuidGenerator()) }); //cria servidor express

const porta = Number(process.env.PORT ?? 3000);
const servidor = app.listen(porta, () => console.log(`API em http://localhost:${porta}`));

// Encerramento limpo: para de aceitar requisições e fecha o pool
async function encerrar(sinal: string) {
  console.log(`${sinal} recebido, encerrando...`);
  servidor.close(async () => {
    await pool.end();
    await redis.quit();
    process.exit(0); //desliga processo do node.js
  });
}
process.on('SIGTERM', () => encerrar('SIGTERM')); //sinal de desligamento, kubernt manda ele quando reinicia um pod e docker quando mata um processo
process.on('SIGINT', () => encerrar('SIGINT')); //sinal disparado quando apertamos o ctrl + c