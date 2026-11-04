import express, { type Express } from 'express';
import { criarRotasProduto } from './routes/produtoRoutes.js';
import { rotaNaoEncontrada } from './middlewares/rotaNaoEncontrada.js';
import { tratarErros } from './middlewares/tratarErros.js';
import type { ProdutoController } from './controllers/ProdutoController.js';

export interface Dependencias {
  produtoController: ProdutoController;
}

export function criarApp(deps: Dependencias): Express {
  const app = express();

  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' })); //limita tamanho do JSON

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/produtos', criarRotasProduto(deps.produtoController));

  app.use(rotaNaoEncontrada); 
  app.use(tratarErros);

  return app;
}