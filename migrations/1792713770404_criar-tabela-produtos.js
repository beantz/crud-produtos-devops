export const up = (pgm) => {
    pgm.createTable('produtos', {
        id: { type: 'varchar(64)', primaryKey: true },
        nome: { type: 'varchar(200)', notNull: true },
        preco: { type: 'numeric(12,2)', notNull: true },
        quantidade: { type: 'integer', notNull: true },
        criado_em: { type: 'timestamptz', notNull: true },
        atualizado_em: { type: 'timestamptz', notNull: true },
    });

    //reforça as invariantes do domínio também no banco
    pgm.addConstraint('produtos', 'produtos_preco_nao_negativo', 'CHECK (preco >= 0)');
    pgm.addConstraint('produtos', 'produtos_quantidade_nao_negativa', 'CHECK (quantidade >= 0)');

    //Unicidade de nome ignorando maiúsculas: espelha o existeComNome
    //cria um indice na coluna de nome e impede a criacao de nomes duplicados, trata maiusculas e minusculas como iguais
    pgm.sql('CREATE UNIQUE INDEX produtos_nome_unico ON produtos (LOWER(TRIM(nome)))');

    //usa api do pgm e cria um indice em criado_em
    pgm.createIndex('produtos', 'criado_em');
};

export const down = (pgm) => {
    pgm.dropTable('produtos');
};
