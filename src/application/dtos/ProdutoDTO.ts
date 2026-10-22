/*representação do Produto para o mundo externo. */
export interface ProdutoDTO {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  disponivel: boolean;
  criadoEm: string;
  atualizadoEm: string;
}
