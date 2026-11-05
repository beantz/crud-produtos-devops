import type { Request, Response } from 'express';
import type { CriarProdutoUseCase } from '../../../application/use-cases/CriarProdutoUseCase.js';
import type { BuscarProdutoPorIdUseCase } from '../../../application/use-cases/BuscarProdutoPorIdUseCase.js';
import type { ListarProdutosUseCase } from '../../../application/use-cases/ListarProdutosUseCase.js';
import type { AtualizarProdutoUseCase } from '../../../application/use-cases/AtualizarProdutoUseCase.js';
import type { AjustarEstoqueUseCase } from '../../../application/use-cases/AjustarEstoqueUseCase.js';
import type { DeletarProdutoUseCase } from '../../../application/use-cases/DeletarProdutoUseCase.js';

interface UseCases {
  criar: CriarProdutoUseCase;
  buscar: BuscarProdutoPorIdUseCase;
  listar: ListarProdutosUseCase;
  atualizar: AtualizarProdutoUseCase;
  ajustarEstoque: AjustarEstoqueUseCase;
  deletar: DeletarProdutoUseCase;
}

//criando um novo tipo
//o & diz ao typs q esse novo tipo possui tudo q request tem e mais um pouco
type ReqValidada = Request & { validado?: { body?: any; params?: any; query?: any } };

export class ProdutoController {
  constructor(private readonly uc: UseCases) {}

  criar = async (req: ReqValidada, res: Response): Promise<void> => {
    //validado! serve pra enganar o typs de q validade esta preenchido
    const output = await this.uc.criar.executar(req.validado!.body);
    res
      .status(201)
      .location(`/produtos/${output.id}`)
      .json(output);
  };

  buscar = async (req: ReqValidada, res: Response): Promise<void> => {
    const output = await this.uc.buscar.executar({ id: req.validado!.params.id });
    res.status(200).json(output);
  };

  listar = async (req: ReqValidada, res: Response): Promise<void> => {
    const output = await this.uc.listar.executar(req.validado!.query ?? {});
    res.status(200).json(output);
  };

  atualizar = async (req: ReqValidada, res: Response): Promise<void> => {
    const output = await this.uc.atualizar.executar({
      id: req.validado!.params.id,
      ...req.validado!.body,
    });
    res.status(200).json(output);
  };

  ajustarEstoque = async (req: ReqValidada, res: Response): Promise<void> => {
    const output = await this.uc.ajustarEstoque.executar({
      id: req.validado!.params.id,
      ...req.validado!.body,
    });
    res.status(200).json(output);
  };

  deletar = async (req: ReqValidada, res: Response): Promise<void> => {
    await this.uc.deletar.executar({ id: req.validado!.params.id });
    //send serve para dizer q a solicitacao foi finalizada e n tem nada pra retornar
    res.status(204).send();
  };
}