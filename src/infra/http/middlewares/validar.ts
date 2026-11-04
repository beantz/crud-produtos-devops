import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type Alvo = 'body' | 'params' | 'query';

export function validar(schema: ZodSchema, alvo: Alvo) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req[alvo]); //safeParse se nao encontrar nao lança erro e sim um obj
    if (!resultado.success) {
      return next(resultado.error); //se chamar next com um argumento deve ir para o middleware de erro
    }
    //guarda o dado já validado/convertido
    //diz q em req vai ter um campo para validade, onde ele vai ser um record opcioal string ou unknow
    (req as Request & { validado?: Record<string, unknown> }).validado = {
      ...((req as any).validado ?? {}), // ... -> espalha o conteudo desse obj no obj novo
      [alvo]: resultado.data, //novo obj validade
    };
    next();
  };
}