'use strict';

const now = new Date();

const themeDefinitions = [
  {
    name: 'Pizzaria',
    slug: 'pizzaria',
    description: 'Requisitos de um sistema de pedidos e gestão de pizzaria.',
  },
  {
    name: 'Hotel',
    slug: 'hotel',
    description: 'Requisitos de um sistema de reservas e gestão hoteleira.',
  },
];

const questions = [
  // Pizzaria — Fácil
  ['pizzaria', 'EASY', 'O sistema deve permitir cadastrar pizzas com nome, descrição e preço.', 'FUNCTIONAL', 'Descreve uma função que o sistema deve executar: cadastrar pizzas.'],
  ['pizzaria', 'EASY', 'O cliente deve poder adicionar e remover pizzas do carrinho.', 'FUNCTIONAL', 'Adicionar e remover itens são comportamentos oferecidos ao usuário.'],
  ['pizzaria', 'EASY', 'O cliente deve poder escolher o tamanho da pizza antes de adicioná-la ao pedido.', 'FUNCTIONAL', 'A seleção do tamanho é uma funcionalidade do processo de compra.'],
  ['pizzaria', 'EASY', 'O usuário deve poder entrar no sistema usando e-mail e senha.', 'FUNCTIONAL', 'O login é uma capacidade fornecida pelo sistema.'],
  ['pizzaria', 'EASY', 'O cliente deve poder acompanhar o status do pedido.', 'FUNCTIONAL', 'A consulta do status é uma função visível para o cliente.'],
  ['pizzaria', 'EASY', 'A interface deve se adaptar a celulares com largura mínima de 320 pixels.', 'NON_FUNCTIONAL', 'Define uma característica de responsividade e usabilidade.'],
  ['pizzaria', 'EASY', 'A página do cardápio deve carregar em até dois segundos.', 'NON_FUNCTIONAL', 'Estabelece um limite mensurável de desempenho.'],
  ['pizzaria', 'EASY', 'As senhas devem ser armazenadas usando hash seguro com salt.', 'NON_FUNCTIONAL', 'Define uma restrição de segurança para o armazenamento das senhas.'],
  ['pizzaria', 'EASY', 'O sistema deve funcionar nas versões recentes de Chrome, Edge e Firefox.', 'NON_FUNCTIONAL', 'Define compatibilidade, e não uma função de negócio.'],
  ['pizzaria', 'EASY', 'Mensagens de erro não devem revelar consultas SQL ou rastros internos.', 'NON_FUNCTIONAL', 'É uma restrição de segurança e tratamento de erros.'],

  // Pizzaria — Médio
  ['pizzaria', 'MEDIUM', 'O sistema deve calcular o total considerando itens, adicionais, descontos e taxa de entrega.', 'FUNCTIONAL', 'O cálculo do valor do pedido é uma regra funcional do sistema.'],
  ['pizzaria', 'MEDIUM', 'O cliente deve poder aplicar um cupom válido antes de concluir o pedido.', 'FUNCTIONAL', 'Aplicar cupons é uma operação disponibilizada ao cliente.'],
  ['pizzaria', 'MEDIUM', 'O sistema deve permitir pagamentos por Pix e cartão.', 'FUNCTIONAL', 'A escolha e o processamento da forma de pagamento são funcionalidades.'],
  ['pizzaria', 'MEDIUM', 'Após a confirmação do pagamento, o sistema deve enviar o pedido para a cozinha.', 'FUNCTIONAL', 'Descreve uma reação automática executada pelo sistema.'],
  ['pizzaria', 'MEDIUM', 'O cliente deve poder cancelar o pedido enquanto o preparo ainda não tiver iniciado.', 'FUNCTIONAL', 'O cancelamento condicionado ao estado é uma regra funcional.'],
  ['pizzaria', 'MEDIUM', 'O sistema deve suportar 500 usuários simultâneos sem indisponibilidade.', 'NON_FUNCTIONAL', 'Define capacidade e desempenho sob carga.'],
  ['pizzaria', 'MEDIUM', 'A aplicação deve manter disponibilidade mensal mínima de 99,5%.', 'NON_FUNCTIONAL', 'Disponibilidade é uma característica de qualidade do serviço.'],
  ['pizzaria', 'MEDIUM', 'Dados de pagamento devem ser transmitidos somente por conexão criptografada.', 'NON_FUNCTIONAL', 'É uma restrição de segurança da comunicação.'],
  ['pizzaria', 'MEDIUM', 'O registro de uma resposta do quiz deve ser concluído em até 500 milissegundos.', 'NON_FUNCTIONAL', 'Define um limite de desempenho mensurável.'],
  ['pizzaria', 'MEDIUM', 'O banco de dados deve receber backup diário com retenção mínima de 30 dias.', 'NON_FUNCTIONAL', 'Backup e retenção são requisitos de confiabilidade operacional.'],

  // Pizzaria — Difícil
  ['pizzaria', 'HARD', 'O sistema deve encaminhar o pedido para a unidade ativa mais próxima do endereço de entrega.', 'FUNCTIONAL', 'O encaminhamento automático é uma regra de processamento do pedido.'],
  ['pizzaria', 'HARD', 'O cliente deve poder agendar a entrega para uma data e horário disponíveis.', 'FUNCTIONAL', 'O agendamento é uma capacidade oferecida ao cliente.'],
  ['pizzaria', 'HARD', 'Quando um cancelamento for aceito após o pagamento, o sistema deve solicitar o estorno.', 'FUNCTIONAL', 'Solicitar o estorno é uma ação que o sistema precisa executar.'],
  ['pizzaria', 'HARD', 'O administrador deve poder gerar relatórios de vendas por período e unidade.', 'FUNCTIONAL', 'A geração do relatório é uma funcionalidade administrativa.'],
  ['pizzaria', 'HARD', 'Ao confirmar um pedido, o sistema deve descontar os ingredientes correspondentes do estoque.', 'FUNCTIONAL', 'Atualizar o estoque é um comportamento decorrente da confirmação.'],
  ['pizzaria', 'HARD', 'Após uma falha crítica, o serviço deve ser restaurado em no máximo 15 minutos.', 'NON_FUNCTIONAL', 'Define o objetivo de tempo de recuperação do sistema.'],
  ['pizzaria', 'HARD', 'O tratamento de dados pessoais deve seguir os princípios da LGPD.', 'NON_FUNCTIONAL', 'Estabelece uma obrigação legal e de privacidade.'],
  ['pizzaria', 'HARD', 'Alterações no status do pedido devem permanecer auditáveis por pelo menos um ano.', 'NON_FUNCTIONAL', 'Define auditabilidade e retenção, características de qualidade.'],
  ['pizzaria', 'HARD', 'A aplicação deve permitir expansão horizontal sem interromper pedidos em andamento.', 'NON_FUNCTIONAL', 'Estabelece escalabilidade e continuidade do serviço.'],
  ['pizzaria', 'HARD', 'Reenvios da mesma requisição de pagamento não devem gerar cobranças duplicadas.', 'NON_FUNCTIONAL', 'Define idempotência e confiabilidade do processamento.'],

  // Hotel — Fácil
  ['hotel', 'EASY', 'O hóspede deve poder pesquisar quartos disponíveis por data de entrada e saída.', 'FUNCTIONAL', 'Pesquisar disponibilidade é uma função oferecida ao hóspede.'],
  ['hotel', 'EASY', 'O hóspede deve poder reservar um quarto disponível.', 'FUNCTIONAL', 'Criar uma reserva é uma funcionalidade central do sistema.'],
  ['hotel', 'EASY', 'O usuário deve poder fazer login com e-mail e senha.', 'FUNCTIONAL', 'O login é um comportamento executado pelo sistema.'],
  ['hotel', 'EASY', 'O hóspede deve poder informar a quantidade de adultos e crianças.', 'FUNCTIONAL', 'Registrar o número de hóspedes é parte funcional da reserva.'],
  ['hotel', 'EASY', 'O hóspede deve poder consultar os detalhes de sua reserva.', 'FUNCTIONAL', 'A consulta de uma reserva é uma função disponibilizada ao usuário.'],
  ['hotel', 'EASY', 'A interface de reservas deve funcionar em celulares a partir de 320 pixels.', 'NON_FUNCTIONAL', 'Define uma propriedade de responsividade.'],
  ['hotel', 'EASY', 'A pesquisa de quartos deve apresentar resultados em até dois segundos.', 'NON_FUNCTIONAL', 'Estabelece um requisito mensurável de desempenho.'],
  ['hotel', 'EASY', 'As senhas devem ser protegidas por hash seguro e nunca gravadas em texto puro.', 'NON_FUNCTIONAL', 'Define uma restrição de segurança.'],
  ['hotel', 'EASY', 'O processo de reserva deve ser totalmente utilizável pelo teclado.', 'NON_FUNCTIONAL', 'Trata de acessibilidade e usabilidade.'],
  ['hotel', 'EASY', 'A aplicação deve ser compatível com as versões recentes dos principais navegadores.', 'NON_FUNCTIONAL', 'Compatibilidade é uma característica de qualidade.'],

  // Hotel — Médio
  ['hotel', 'MEDIUM', 'O sistema deve impedir duas reservas confirmadas para o mesmo quarto no mesmo período.', 'FUNCTIONAL', 'É uma regra de negócio que o sistema deve aplicar.'],
  ['hotel', 'MEDIUM', 'Após confirmar uma reserva, o sistema deve enviar um e-mail ao hóspede.', 'FUNCTIONAL', 'O envio da confirmação é uma ação automática do sistema.'],
  ['hotel', 'MEDIUM', 'O hóspede deve poder cancelar uma reserva conforme a política da tarifa.', 'FUNCTIONAL', 'O cancelamento condicionado é uma funcionalidade.'],
  ['hotel', 'MEDIUM', 'O recepcionista deve poder registrar o check-in e o check-out do hóspede.', 'FUNCTIONAL', 'Registrar entrada e saída é uma operação do sistema.'],
  ['hotel', 'MEDIUM', 'O sistema deve calcular o valor da hospedagem usando diárias, taxas e serviços contratados.', 'FUNCTIONAL', 'O cálculo do valor é uma regra funcional de negócio.'],
  ['hotel', 'MEDIUM', 'O sistema deve atender 300 usuários simultâneos mantendo os tempos de resposta definidos.', 'NON_FUNCTIONAL', 'Define capacidade e desempenho sob carga.'],
  ['hotel', 'MEDIUM', 'O serviço de reservas deve possuir disponibilidade mensal mínima de 99,9%.', 'NON_FUNCTIONAL', 'Disponibilidade é uma propriedade não funcional.'],
  ['hotel', 'MEDIUM', 'O banco de reservas deve possuir backup diário automatizado.', 'NON_FUNCTIONAL', 'Backup é uma exigência de confiabilidade e operação.'],
  ['hotel', 'MEDIUM', 'Os logs não devem armazenar números completos de documentos ou cartões.', 'NON_FUNCTIONAL', 'Define uma restrição de privacidade e segurança.'],
  ['hotel', 'MEDIUM', 'A consulta de disponibilidade da API deve responder em até 700 milissegundos.', 'NON_FUNCTIONAL', 'Estabelece uma meta mensurável de desempenho.'],

  // Hotel — Difícil
  ['hotel', 'HARD', 'O sistema deve sincronizar a disponibilidade com canais externos de reservas.', 'FUNCTIONAL', 'A sincronização é uma integração funcional executada pelo sistema.'],
  ['hotel', 'HARD', 'Ao cancelar uma reserva, o sistema deve liberar automaticamente o quarto para o período.', 'FUNCTIONAL', 'Liberar o inventário é uma ação decorrente do cancelamento.'],
  ['hotel', 'HARD', 'O sistema deve manter uma lista de espera e avisar o primeiro interessado quando surgir uma vaga.', 'FUNCTIONAL', 'Gerenciar e notificar a lista de espera são funcionalidades.'],
  ['hotel', 'HARD', 'O gerente deve poder gerar relatórios de ocupação e receita por período.', 'FUNCTIONAL', 'Gerar relatórios é uma capacidade administrativa.'],
  ['hotel', 'HARD', 'O sistema deve processar depósitos antecipados e estornos de reservas canceladas.', 'FUNCTIONAL', 'Processar depósitos e estornos descreve ações do sistema.'],
  ['hotel', 'HARD', 'Em caso de desastre, o banco de reservas deve ser restaurado em até 30 minutos.', 'NON_FUNCTIONAL', 'Define o tempo máximo de recuperação.'],
  ['hotel', 'HARD', 'Dados pessoais armazenados devem permanecer criptografados em repouso.', 'NON_FUNCTIONAL', 'É uma restrição de segurança sobre os dados armazenados.'],
  ['hotel', 'HARD', 'A coleta e o tratamento de dados dos hóspedes devem respeitar a LGPD.', 'NON_FUNCTIONAL', 'Estabelece conformidade legal e de privacidade.'],
  ['hotel', 'HARD', 'Alterações em reservas devem permanecer auditáveis por pelo menos dois anos.', 'NON_FUNCTIONAL', 'Define auditabilidade e retenção de histórico.'],
  ['hotel', 'HARD', 'Requisições concorrentes não devem produzir reservas duplicadas para o mesmo quarto.', 'NON_FUNCTIONAL', 'Define consistência e confiabilidade em situação de concorrência.'],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'themes',
        themeDefinitions.map((theme) => ({
          ...theme,
          minimum_questions: 20,
          status: 'ACTIVE',
          created_at: now,
          updated_at: now,
        })),
        { transaction },
      );

      await queryInterface.bulkInsert(
        'modalities',
        [
          {
            name: 'Clássica',
            slug: 'classica',
            description: 'Partida de 10 perguntas de um tema e dificuldade escolhidos.',
            default_question_count: 10,
            score_multiplier: 1,
            status: 'ACTIVE',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      const themes = await queryInterface.sequelize.query(
        'SELECT id, slug FROM themes WHERE slug IN (:slugs)',
        {
          replacements: { slugs: themeDefinitions.map(({ slug }) => slug) },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const [modality] = await queryInterface.sequelize.query(
        'SELECT id FROM modalities WHERE slug = :slug LIMIT 1',
        {
          replacements: { slug: 'classica' },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const themeIdBySlug = new Map(themes.map((theme) => [theme.slug, theme.id]));

      await queryInterface.bulkInsert(
        'phases',
        [
          ['Fácil', 1, 'EASY', 30, 1],
          ['Médio', 2, 'MEDIUM', 20, 1.5],
          ['Difícil', 3, 'HARD', 10, 2],
        ].map(([name, sequence, difficulty, seconds, multiplier]) => ({
          modality_id: modality.id,
          name,
          sequence,
          difficulty,
          question_count: 10,
          time_limit_seconds: seconds,
          score_multiplier: multiplier,
          status: 'ACTIVE',
          created_at: now,
          updated_at: now,
        })),
        { transaction },
      );

      await queryInterface.bulkInsert(
        'questions',
        questions.map(([themeSlug, difficulty, statement, , explanation]) => ({
          theme_id: themeIdBySlug.get(themeSlug),
          statement,
          explanation,
          difficulty,
          status: 'ACTIVE',
          created_by: null,
          updated_by: null,
          created_at: now,
          updated_at: now,
        })),
        { transaction },
      );

      const insertedQuestions = await queryInterface.sequelize.query(
        'SELECT id, theme_id, statement FROM questions WHERE theme_id IN (:themeIds)',
        {
          replacements: { themeIds: [...themeIdBySlug.values()] },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const questionIdByKey = new Map(
        insertedQuestions.map((question) => [
          `${question.theme_id}|${question.statement}`,
          question.id,
        ]),
      );

      const alternatives = questions.flatMap(
        ([themeSlug, , statement, correctType]) => {
          const questionId = questionIdByKey.get(
            `${themeIdBySlug.get(themeSlug)}|${statement}`,
          );

          return [
            {
              question_id: questionId,
              option_type: 'FUNCTIONAL',
              label: 'Funcional',
              is_correct: correctType === 'FUNCTIONAL',
              status: 'ACTIVE',
              created_at: now,
              updated_at: now,
            },
            {
              question_id: questionId,
              option_type: 'NON_FUNCTIONAL',
              label: 'Não Funcional',
              is_correct: correctType === 'NON_FUNCTIONAL',
              status: 'ACTIVE',
              created_at: now,
              updated_at: now,
            },
          ];
        },
      );

      await queryInterface.bulkInsert('alternatives', alternatives, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const themes = await queryInterface.sequelize.query(
        'SELECT id FROM themes WHERE slug IN (:slugs)',
        {
          replacements: { slugs: themeDefinitions.map(({ slug }) => slug) },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const themeIds = themes.map(({ id }) => id);
      const insertedQuestions = themeIds.length
        ? await queryInterface.sequelize.query(
            'SELECT id FROM questions WHERE theme_id IN (:themeIds)',
            {
              replacements: { themeIds },
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            },
          )
        : [];
      const questionIds = insertedQuestions.map(({ id }) => id);

      if (questionIds.length) {
        await queryInterface.bulkDelete(
          'alternatives',
          { question_id: { [Sequelize.Op.in]: questionIds } },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'questions',
          { id: { [Sequelize.Op.in]: questionIds } },
          { transaction },
        );
      }

      const modalities = await queryInterface.sequelize.query(
        'SELECT id FROM modalities WHERE slug = :slug',
        {
          replacements: { slug: 'classica' },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const modalityIds = modalities.map(({ id }) => id);

      if (modalityIds.length) {
        await queryInterface.bulkDelete(
          'phases',
          { modality_id: { [Sequelize.Op.in]: modalityIds } },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'modalities',
          { id: { [Sequelize.Op.in]: modalityIds } },
          { transaction },
        );
      }

      if (themeIds.length) {
        await queryInterface.bulkDelete(
          'themes',
          { id: { [Sequelize.Op.in]: themeIds } },
          { transaction },
        );
      }
    });
  },
};
