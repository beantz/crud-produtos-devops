import { Router } from 'express';
import type { ProdutoController } from '../controllers/ProdutoController.js';
import { validar } from '../middlewares/validar.js';
import { asyncHandler } from '../asyncHandler.js';
import {
  criarProdutoSchema,
  atualizarProdutoSchema,
  ajustarEstoqueSchema,
  idParamSchema,
  listarQuerySchema,
} from '../schemas/produtoSchemas.js';

export function criarRotasProduto(c: ProdutoController): Router {
  const r = Router();

  r.post('/',                 validar(criarProdutoSchema, 'body'),                                   asyncHandler(c.criar));
  r.get('/',                  validar(listarQuerySchema, 'query'),                                   asyncHandler(c.listar));
  r.get('/:id',               validar(idParamSchema, 'params'),                                      asyncHandler(c.buscar));
  r.patch('/:id',             validar(idParamSchema, 'params'), validar(atualizarProdutoSchema, 'body'),    asyncHandler(c.atualizar));
  r.post('/:id/estoque',      validar(idParamSchema, 'params'), validar(ajustarEstoqueSchema, 'body'),      asyncHandler(c.ajustarEstoque));
  r.delete('/:id',            validar(idParamSchema, 'params'),                                      asyncHandler(c.deletar));

  return r;
}