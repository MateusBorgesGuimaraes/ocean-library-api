# Ocean Library API

**Ocean Library API** é uma REST API desenvolvida utilizando **NestJS**, **PostgreSQL** e a ORM **TypeORM**. Este projeto foi criado com o objetivo de estudar e aprender as tecnologias mencionadas, servindo como backend para um futuro sistema de biblioteca.

## Funcionalidades

A aplicação suporta as seguintes operações:

### 1. Rotas Gerais (AppController)
- **GET /**: Rota inicial, utilizada para verificação de status ou como página principal.

### 2. Eventos da Biblioteca (LibraryEventsController)
- **POST /library-events**: Cria um evento.
- **POST /library-events/:id/register**: Inscreve um usuário em um evento.
- **POST /library-events/upload-banner/:id**: Faz upload de um banner para o evento.
- **GET /library-events**: Lista todos os eventos.
- **GET /library-events/:id**: Busca detalhes de um evento específico.
- **GET /library-events/:id/registrations**: Obtém inscrições de um evento.
- **GET /library-events/search/title**: Pesquisa eventos por título.
- **GET /library-events/user/:userId/events**: Lista eventos associados a um usuário.
- **PATCH /library-events/:id**: Atualiza detalhes de um evento.
- **DELETE /library-events/:id**: Remove um evento.
- **DELETE /library-events/:eventId/registrations/:userId**: Remove a inscrição de um usuário em um evento.

### 3. Livros (BooksController)
- **POST /books**: Adiciona um novo livro.
- **POST /books/upload-cover/:id**: Faz upload da capa de um livro.
- **GET /books/search**: Pesquisa livros.
- **GET /books/:id**: Busca detalhes de um livro.
- **PATCH /books/:id**: Atualiza informações de um livro.
- **DELETE /books/:id**: Remove um livro.

### 4. Empréstimos (LoansController)
- **GET /loans/statistics**: Exibe estatísticas de empréstimos.
- **POST /loans**: Cria um empréstimo.
- **GET /loans/findAll**: Lista todos os empréstimos.
- **GET /loans/:id**: Busca detalhes de um empréstimo.
- **PUT /loans/:id/pickup**: Marca um empréstimo como retirado.
- **PUT /loans/:id/renew**: Renova um empréstimo.
- **PUT /loans/:id/return**: Marca um empréstimo como devolvido.
- **GET /loans/user/:userId**: Lista os empréstimos de um usuário.
- **GET /loans/status/overdue**: Lista empréstimos atrasados.
- **GET /loans/search/email**: Pesquisa empréstimos pelo email do usuário.
- **GET /loans/directly/:bookId/:userId**: Realiza empréstimo direto já com o status de "retirado".

### 5. Categorias (CategoryController)
- **POST /category**: Adiciona uma nova categoria.
- **GET /category**: Lista todas as categorias.
- **GET /category/:id**: Busca uma categoria específica.
- **PATCH /category/:id**: Atualiza uma categoria.
- **DELETE /category/:id**: Remove uma categoria.

### 6. Solicitações de Livros (RequestsController)
- **POST /requests**: Adiciona uma solicitação de livro.
- **GET /requests**: Lista todas as solicitações.
- **DELETE /requests/:id**: Remove uma solicitação.

### 7. Notícias (NewsController)
- **POST /news**: Cria uma notícia.
- **POST /news/upload-cover-image/:id**: Faz upload da imagem de capa de uma notícia.
- **GET /news**: Lista todas as notícias.
- **GET /news/:id**: Busca detalhes de uma notícia específica.
- **GET /news/search/title**: Pesquisa notícias por título.
- **PATCH /news/:id**: Atualiza uma notícia.
- **DELETE /news/:id**: Remove uma notícia.

### 8. Usuários (UsersController)
- **POST /users**: Cria um novo usuário.
- **GET /users**: Lista todos os usuários.
- **GET /users/:id**: Busca detalhes de um usuário.
- **GET /users/search/email**: Pesquisa usuários por email.

### 9. Autenticação (AuthController)
- **POST /auth/login**: Realiza login do usuário.

## Recursos Adicionais
- **Autenticação e Autorização**: Implementação com hash de senhas (bcrypt) e sistema de roles.
- **Sistema de Permissões**: Baseado nos seguintes papéis:
  - **Admin**: Permissão total.
  - **User**: Pode visualizar e buscar livros, eventos e notícias, mas sem interagir diretamente.
  - **SocialMedia**: Gerencia eventos e notícias, exceto ações envolvendo usuários.
  - **StockController**: Gerencia solicitações e operações relacionadas a livros, como reposição, adição e edição.
  - **Librarian**: Gerencia empréstimos e visualiza algumas informações dos usuários nos eventos.

### Observações
- Usuários podem ter múltiplos papéis. Exemplo: Maria pode ser **[SocialMedia, StockController]**.
- Todos os usuários cadastrados possuem, por padrão, o papel de **User**.

---
Este projeto foi desenvolvido como parte de um estudo e serve como base para futuras melhorias e implementações.
