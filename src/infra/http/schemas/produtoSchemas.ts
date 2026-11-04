import { z } from 'zod';
//Validação com Zod vem antes dos controllers
//valida a forma, se e string ou  number, impede q chegue '123' como string no useCase

const nome = z.string().trim().min(3).max(200);
const preco = z.number().finite().nonnegative();
const quantidade = z.number().int().nonnegative();

export const criarProdutoSchema = z.object({
  nome,
  preco,
  quantidade,
}).strict(); //rejeita campos desconhecidos

export const atualizarProdutoSchema = z.object({
  nome: nome.optional(),
  preco: preco.optional(),
}).strict();

export const ajustarEstoqueSchema = z.object({
  tipo: z.enum(['adicionar', 'remover']),
  quantidade: z.number().int().positive(),
}).strict();

export const idParamSchema = z.object({
  id: z.string().trim().min(1).max(64),
});

export const listarQuerySchema = z.object({
  //query string chega como texto: coerce converte "2" em 2
  pagina: z.coerce.number().int().optional(),
  limite: z.coerce.number().int().optional(),
  nome: z.string().trim().optional(),
  apenasDisponiveis: z.enum(['true', 'false']).transform((v) => v === 'true').optional(), //no final tranforma o texto em boolean
});