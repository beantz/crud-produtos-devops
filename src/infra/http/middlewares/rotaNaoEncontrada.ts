import type { Request, Response } from 'express';

export function rotaNaoEncontrada(req: Request, res: Response): void {
  res.status(404).json({
    erro: { codigo: 'ROTA_NAO_ENCONTRADA', mensagem: `${req.method} ${req.path} não existe` },
  });
}