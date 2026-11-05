import type { Request, Response, NextFunction, RequestHandler } from 'express';

 //uma função que recebe outra função (fn) como parâmetro
export const asyncHandler =
  //fn == controller, ele recebe os params q tem q receber
  (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); //se a promisse falhar pega o erro e manda pra next e dai ele manda para os middleware
  };