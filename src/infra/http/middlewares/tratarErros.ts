import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationError } from '../../../domain/errors/ValidationError.js';
import { NotFoundError } from '../../../domain/errors/NotFoundError.js';
import { DuplicateProductError } from '../../../domain/errors/DuplicateProductError.js';

interface Corpo {
  erro: { codigo: string; mensagem: string; detalhes?: unknown };
}

export function tratarErros(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction, //os 4 parâmetros são o que faz o Express reconhecer um handler de erro
): void {
  const { status, corpo } = traduzir(err);

  if (status >= 500) {
    console.error(err); //no log completo; ao cliente vai mensagem genérica
  }
  res.status(status).json(corpo);
}

function traduzir(err: unknown): { status: number; corpo: Corpo } {
  if (err instanceof ZodError) {
    return {
      status: 400,
      corpo: {
        erro: {
          codigo: 'REQUISICAO_INVALIDA',
          mensagem: 'Dados de entrada inválidos',
          detalhes: err.issues.map((i) => ({ campo: i.path.join('.'), motivo: i.message })),
        },
      },
    };
  }
  if (err instanceof ValidationError) {
    return { status: 422, corpo: { erro: { codigo: 'VALIDACAO', mensagem: err.message } } };
  }
  if (err instanceof NotFoundError) {
    return { status: 404, corpo: { erro: { codigo: 'NAO_ENCONTRADO', mensagem: err.message } } };
  }
  if (err instanceof DuplicateProductError) {
    return { status: 409, corpo: { erro: { codigo: 'DUPLICADO', mensagem: err.message } } };
  }
  //json malformado no body (erro do express.json middleware q verifica o json)
  //body in (err as obj) verifica se possui um body dentro do obj err
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    return { status: 400, corpo: { erro: { codigo: 'JSON_INVALIDO', mensagem: 'Corpo não é um JSON válido' } } };
  }
  return {
    status: 500,
    corpo: { erro: { codigo: 'ERRO_INTERNO', mensagem: 'Erro interno do servidor' } },
  };
}