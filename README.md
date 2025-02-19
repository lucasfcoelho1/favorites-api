# Favorites API

## Índice

- [Executando a Aplicação com Docker Compose](#executando-a-aplicação-com-docker-compose)
- [Executando a Aplicação Localmente](#executando-a-aplicação-localmente)
- [Documentação da API](#documentação-da-api)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Endpoints da API](#endpoints-da-api)
  - [Autenticação](#autenticação)
  - [Contas](#contas)
  - [Favoritos](#favoritos)
  - [Produtos](#produtos)
- [Testes e Cobertura de Código](#testes-e-cobertura-de-código)

## Executando a Aplicação com Docker Compose

### Pré-requisitos

Para executar a aplicação, você precisará ter o Docker 🐳 instalado na sua máquina. Se você ainda não tem o Docker instalado, fui na frente e peguei a instalação pro teu sistema operacional:

- **Windows**: [Instalando o Docker no Windows](https://docs.docker.com/desktop/windows/install/)
- **Mac**: [Instalando o Docker no Mac](https://docs.docker.com/desktop/mac/install/)
- **Linux**: [Instalando o Docker no Linux](https://docs.docker.com/engine/install/)

### Passos para Executar a Aplicação

1. Clone este repositório:

   ```sh
   git clone https://github.com/lucasfcoelho1/favorites-api.git
   cd favorites-api
   ```

2. Execute o Docker Compose:

   ```sh
   docker-compose up --build
   ```

3. Acesse a aplicação em `http://localhost:4200`. 🖖

### Documentação da API

A documentação completa com Swagger da API está disponível em `http://localhost:4200/api`.

### Executando a Aplicação Localmente

Se você preferir executar a aplicação diretamente na sua máquina, siga os passos abaixo. Recomendo fortemente o uso do `pnpm` para gerenciar as dependências.

1. Instale o `pnpm` globalmente, se ainda não tiver:

   ```sh
   npm install -g pnpm
   ```

2. Instale as dependências do projeto:

   ```sh
   pnpm install
   ```

3. Execute as migrações do banco de dados:

   ```sh
   pnpm db:deploy
   ```

4. Inicie a aplicação:

   ```sh
   pnpm start:dev
   ```

5. Acesse a aplicação em `http://localhost:4200`.

## Estrutura do Banco de Dados

A aplicação utiliza um banco de dados PostgreSQL com as seguintes tabelas e relações:

- **User**: Representa os usuários da aplicação.

  - Campos: `id`, `name`, `email`, `passwordHash`
  - Relação: Um usuário pode ter uma lista de favoritos (relação um-para-um com `FavoriteList`).

- **FavoriteList**: Representa a lista de favoritos de um usuário.

  - Campos: `id`, `title`, `description`, `userId`
  - Relação: Uma lista de favoritos pertence a um usuário e pode conter vários produtos favoritos (relação um-para-muitos com `FavoriteProduct`).

- **Product**: Representa os produtos que podem ser adicionados à lista de favoritos.

  - Campos: `id`, `name`, `price`, `image`
  - Relação: Um produto pode estar em várias listas de favoritos (relação muitos-para-muitos com `FavoriteProduct`).

- **FavoriteProduct**: Representa a relação entre uma lista de favoritos e um produto.

  - Campos: `id`, `favoriteListId`, `productId`
  - Relação: Liga uma lista de favoritos a um produto específico.

  ### Schema do Banco de Dados

  [Imagem com o schema](database-schema.png)

## Endpoints da API

### Autenticação

### Contas

#### Criar uma nova conta

- **URL**: `/accounts`
- **Método**: `POST`
- **Descrição**: Cria uma nova conta de usuário.
- **Corpo da Requisição**:
  ```json
  {
    "name": "Lu do Magalu",
    "email": "lu@domagalu.com",
    "passwordHash": "123456"
  }
  ```
- **Respostas**:
  - `201`: Conta criada com sucesso.
  - `409`: Usuário com o mesmo e-mail já existe.

#### Obter um usuário pelo ID

- **URL**: `/accounts/user/:id`
- **Método**: `GET`
- **Descrição**: Retorna os detalhes de um usuário pelo ID.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Usuário encontrado.
  - `404`: Usuário não encontrado.

#### Atualizar um usuário existente

- **URL**: `/accounts/user/:id`
- **Método**: `PUT`
- **Descrição**: Atualiza os detalhes de um usuário existente.
- **Autenticação**: Bearer Token
- **Corpo da Requisição**:
  ```json
  {
    "name": "Lu Lu do Magalu",
    "email": "lu_lud@domagalu.com",
    "passwordHash": "654321"
  }
  ```
- **Respostas**:
  - `200`: Usuário atualizado com sucesso.
  - `404`: Usuário não encontrado.

#### Deletar um usuário pelo ID

- **URL**: `/accounts/user/:id`
- **Método**: `DELETE`
- **Descrição**: Deleta um usuário pelo ID.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Usuário deletado com sucesso.
  - `404`: Usuário não encontrado.

#### Deletar todos os usuários

- **URL**: `/accounts`
- **Método**: `DELETE`
- **Descrição**: Deleta todos os usuários.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Todos os usuários foram deletados com sucesso.

#### Listar todos os usuários

- **URL**: `/accounts`
- **Método**: `GET`
- **Descrição**: Retorna uma lista de todos os usuários.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Lista de usuários retornada com sucesso.

#### Autenticar um usuário

- **URL**: `/sessions`
- **Método**: `POST`
- **Descrição**: Autentica um usuário e retorna um token JWT.
- **Corpo da Requisição**:
  ```json
  {
    "email": "lu@domagalu.com",
    "passwordHash": "123456"
  }
  ```
- **Respostas**:
  - `201`: Usuário autenticado com sucesso.
  - `401`: As credenciais do usuário não correspondem.

### Favoritos

#### Criar uma lista de favoritos para um usuário

- **URL**: `/favorite/user/:userId`
- **Método**: `POST`
- **Descrição**: Cria uma lista de favoritos para um usuário.
- **Autenticação**: Bearer Token
- **Corpo da Requisição**:
  ```json
  {
    "title": "Lista de Favoritos",
    "description": "Lista de favoritos da Lu do Magalu"
  }
  ```
- **Respostas**:
  - `201`: Lista de favoritos criada com sucesso.
  - `400`: O usuário já tem uma lista, não é possível criar outra.

#### Adicionar um produto aos favoritos

- **URL**: `/favorite/:userId/product/:productId`
- **Método**: `POST`
- **Descrição**: Adiciona um produto aos favoritos de um usuário.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `201`: Produto adicionado aos favoritos com sucesso.
  - `404`: Usuário ou produto não encontrado.
  - `400`: Limite de 5 produtos atingido ou produto já favoritado.

#### Obter a lista de favoritos de um usuário

- **URL**: `/favorite/user/:userId`
- **Método**: `GET`
- **Descrição**: Retorna a lista de favoritos de um usuário.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Lista de favoritos retornada com sucesso.
  - `404`: Lista não encontrada.

#### Remover um produto dos favoritos

- **URL**: `/favorite/:userId/product/:productId`
- **Método**: `DELETE`
- **Descrição**: Remove um produto dos favoritos de um usuário.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Produto removido dos favoritos com sucesso.
  - `404`: Lista ou produto não encontrado.

#### Deletar a lista de favoritos de um usuário

- **URL**: `/favorite/:userId`
- **Método**: `DELETE`
- **Descrição**: Deleta a lista de favoritos de um usuário.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Lista de favoritos deletada com sucesso.
  - `404`: Lista não encontrada.

### Produtos

#### Obter produtos de um usuário

- **URL**: `/products/user/:userId`
- **Método**: `GET`
- **Descrição**: Retorna uma lista de produtos de um usuário.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Lista de produtos retornada com sucesso.

#### Deletar todos os produtos

- **URL**: `/products`
- **Método**: `DELETE`
- **Descrição**: Deleta todos os produtos.
- **Autenticação**: Bearer Token
- **Respostas**:
  - `200`: Todos os produtos foram deletados com sucesso.

## Testes e Cobertura de Código

### Testes

Os testes foram escritos utilizando o framework [Vitest](https://vitest.dev/). Para executar os testes, utilize os seguintes comandos:

- Executar os testes de unidade:

  ```sh
  pnpm test
  ```

- Executar os testes com cobertura de código:

  ```sh
  pnpm test:cov
  ```

- Executar os testes E2E:
  ```sh
  pnpm test:e2e
  ```

### Cobertura de Código

Toda vez que é executado os resultados da última execução dos testes com cobertura de código são dispostos no terminal e também são salvos em um arquivo em:

['/coverage/index.html': Abra-o na sua máquina](/coverage/index.html)

