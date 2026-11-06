import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { criarApp } from '../http/app.js';
import { criarProdutoController } from '../../main/factories/criarContainer.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { FakeIdGenerator } from '../../shared/testing/FakeIdGenerator.js';

describe('API /produtos', () => {
  let app: Express;

  beforeEach(() => {
    const repo = new InMemoryProdutoRepository();
    app = criarApp({ produtoController: criarProdutoController(repo, new FakeIdGenerator()) });
  });

  const novo = { nome: 'Notebook', preco: 3500, quantidade: 10 };

  describe('POST /produtos', () => {
    it('201 e Location ao criar', async () => {
      //send aqui encaminha o dado a ser usado
      const res = await request(app).post('/produtos').send(novo);

      expect(res.status).toBe(201);
      expect(res.headers.location).toBe('/produtos/id-1');
      expect(res.body).toMatchObject({ id: 'id-1', nome: 'Notebook', disponivel: true });
    });

    it('400 quando o tipo está errado (Zod)', async () => {
      const res = await request(app).post('/produtos').send({ ...novo, preco: 'abc' });

      expect(res.status).toBe(400);
      expect(res.body.erro.codigo).toBe('REQUISICAO_INVALIDA');
      expect(res.body.erro.detalhes[0].campo).toBe('preco');
    });

    it('400 quando faltam campos', async () => {
      const res = await request(app).post('/produtos').send({ nome: 'Sem preço' });
      expect(res.status).toBe(400);
    });

    it('400 quando vem campo desconhecido (strict)', async () => {
      const res = await request(app).post('/produtos').send({ ...novo, id: 'hack' });
      expect(res.status).toBe(400);
    });

    it('400 para JSON malformado', async () => {
      const res = await request(app)
        .post('/produtos')
        .set('Content-Type', 'application/json')
        .send('{ isso nao e json'); //envia json malformado

      expect(res.status).toBe(400);
      expect(res.body.erro.codigo).toBe('JSON_INVALIDO');
    });

    it('400 para nome curto (barrado já na borda)', async () => {
      const res = await request(app).post('/produtos').send({ ...novo, nome: 'ab' });
      expect(res.status).toBe(400);
    });

    it('409 para nome duplicado', async () => {
      await request(app).post('/produtos').send(novo);
      const res = await request(app).post('/produtos').send({ ...novo, nome: 'NOTEBOOK' });

      expect(res.status).toBe(409);
      expect(res.body.erro.codigo).toBe('DUPLICADO');
    });
  });

  describe('GET /produtos/:id', () => {
    it('200 com o produto', async () => {
      await request(app).post('/produtos').send(novo);
      const res = await request(app).get('/produtos/id-1');

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Notebook');
    });

    it('404 quando não existe', async () => {
      const res = await request(app).get('/produtos/nao-existe');

      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe('NAO_ENCONTRADO');
    });
  });

  describe('GET /produtos', () => {
    it('lista com paginação e total', async () => {
      for (let i = 1; i <= 25; i++) {
        await request(app).post('/produtos').send({ ...novo, nome: `Produto ${i}` });
      }

      const res = await request(app).get('/produtos?pagina=3&limite=10');

      expect(res.status).toBe(200);
      expect(res.body.itens).toHaveLength(5); //qts itens na ultima pag
      expect(res.body.total).toBe(25);
      expect(res.body.totalPaginas).toBe(3);
    });

    it('converte query string (texto) em número e booleano', async () => {
      await request(app).post('/produtos').send({ ...novo, nome: 'Com estoque' });
      await request(app).post('/produtos').send({ ...novo, nome: 'Sem estoque', quantidade: 0 });

      const res = await request(app).get('/produtos?apenasDisponiveis=true');

      expect(res.body.itens).toHaveLength(1);
    });

    it('400 para pagina não numérica', async () => {
      const res = await request(app).get('/produtos?pagina=abc');
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /produtos/:id', () => {
    it('200 e altera só o enviado', async () => {
      await request(app).post('/produtos').send(novo);
      const res = await request(app).patch('/produtos/id-1').send({ preco: 4000 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ preco: 4000, nome: 'Notebook' });
    });

    it('404 quando não existe', async () => {
      const res = await request(app).patch('/produtos/xx').send({ preco: 1 });
      expect(res.status).toBe(404);
    });

    it('persiste a alteração', async () => {
      await request(app).post('/produtos').send(novo);
      await request(app).patch('/produtos/id-1').send({ preco: 4000 });

      const res = await request(app).get('/produtos/id-1');
      expect(res.body.preco).toBe(4000);
    });
  });

  describe('POST /produtos/:id/estoque', () => {
    beforeEach(async () => {
      await request(app).post('/produtos').send(novo);
    });

    it('200 ao remover', async () => {
      const res = await request(app).post('/produtos/id-1/estoque').send({ tipo: 'remover', quantidade: 4 });

      expect(res.status).toBe(200);
      expect(res.body.quantidade).toBe(6);
    });

    it('422 ao remover mais que o estoque (regra de negócio)', async () => {
      const res = await request(app).post('/produtos/id-1/estoque').send({ tipo: 'remover', quantidade: 100 });

      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe('VALIDACAO');
    });

    it('400 para tipo inválido', async () => {
      const res = await request(app).post('/produtos/id-1/estoque').send({ tipo: 'roubar', quantidade: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /produtos/:id', () => {
    it('204 sem corpo, e some do GET', async () => {
      await request(app).post('/produtos').send(novo);

      const del = await request(app).delete('/produtos/id-1');
      expect(del.status).toBe(204);
      expect(del.body).toEqual({});

      expect((await request(app).get('/produtos/id-1')).status).toBe(404);
    });

    it('404 quando não existe', async () => {
      expect((await request(app).delete('/produtos/xx')).status).toBe(404);
    });
  });

  describe('infra da API', () => {
    it('GET /health responde 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });

    it('404 em rota desconhecida, no formato padrão', async () => {
      const res = await request(app).get('/nada');

      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
    });

    it('não vaza detalhes em erro inesperado (500)', async () => {
      const repoQuebrado = new InMemoryProdutoRepository();
      //lancar erro ao inves de buscar por algo
      repoQuebrado.buscarPorId = async () => { throw new Error('senha do banco: 1234'); };
      const appQuebrado = criarApp({
        produtoController: criarProdutoController(repoQuebrado, new FakeIdGenerator()),
      });

      const res = await request(appQuebrado).get('/produtos/x');

      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain('senha');
    });
  });
});