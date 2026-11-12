# REAL LÍDER — Gestão para autoescolas

Protótipo front-end com uma página HTML por área do sistema. O conteúdo, os formulários e as tabelas principais ficam nos próprios documentos; o JavaScript compartilhado cuida apenas da navegação, dos dados locais e das interações.

## Como abrir

1. Abra esta pasta no Visual Studio Code.
2. Inicie o `index.html` com a extensão Live Server.
3. Mantenha a conexão com a internet para carregar a fonte Inter.

## Páginas

- `index.html`: entrada e contas demonstrativas.
- `dashboard.html`: visão geral da operação.
- `alunos.html`: consulta, cadastro, edição e remoção de alunos.
- `agenda.html`: cadastro, edição, remoção e filtro de aulas.
- `financeiro.html`: lançamentos de receitas/despesas e exportação CSV.
- `relatorios.html`: indicadores da operação e exportação CSV.
- `equipe.html`: perfis demonstrativos e informações da unidade.
- `portal-aluno.html` e `portal-instrutor.html`: páginas de cada perfil.

## Organização do código

- `css/styles.css`: estilos compartilhados, temas e responsividade.
- `js/app.js`: inicialização, navegação, renderização das tabelas e eventos.
- `js/data.js`: usuários demonstrativos e dados iniciais.
- `js/utils.js`: armazenamento local, formatação, escape de texto e CSV.
- `assets/favicon.png`: ícone da aplicação.

## Acesso demonstrativo

Senha para todas as contas: `Demo@123`
Para administrador, recepção e instrutor, o login pede um código demonstrativo de 6 dígitos; qualquer sequência com esse tamanho é aceita. O aluno acessa diretamente o portal.

| Perfil | CPF |
|---|---|
| Administrador | `000.000.000-00` |
| Recepção | `111.111.111-11` |
| Instrutor | `222.222.222-22` |
| Aluno | `333.333.333-33` |

## Limitações

Os dados e a sessão são salvos no `localStorage` do navegador. Login, permissões e portais são apenas demonstrações e não substituem autenticação ou autorização no servidor. Não use informações pessoais ou financeiras reais. Para produção, integre uma API e um banco de dados com controles adequados de acesso e segurança.
