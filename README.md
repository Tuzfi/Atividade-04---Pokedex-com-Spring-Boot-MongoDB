# 💾 Pokédex Full Stack — React + Spring Boot + MongoDB

Atividade 04 da disciplina **Desenvolvimento e Integração de Aplicações Web**.

A Pokédex da Atividade 03 (React + Vite) deixou de ler o arquivo `pokedex-data.json` e passou a consumir uma **API REST em Spring Boot**, com os dados armazenados no **MongoDB Atlas**. Os dados foram extraídos do `Script_Pokedex.sql` e adaptados para o modelo de documentos do MongoDB.

---

## 🔄 Arquitetura

```text
React + Vite (localhost:5173)
        │  fetch /api/...  (proxy do Vite)
        ▼
Spring Boot REST API (localhost:8080)
        │  Spring Data MongoDB
        ▼
MongoDB Atlas  ◄── populado a partir do Script_Pokedex.sql na primeira execução
```

---

## 🛠️ Tecnologias

**Backend**
- Java 25
- Spring Boot 4.2 (Spring Web MVC)
- Spring Data MongoDB
- Maven Wrapper

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion e Lucide React

**Banco de dados**
- MongoDB Atlas

---

## 📁 Estrutura do projeto

```text
my-app/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── config/DataSeeder.java      # Lê o Script_Pokedex.sql e popula o MongoDB
│   │   ├── controller/                 # PokemonController, TrainerController
│   │   ├── service/                    # PokemonService, TrainerService
│   │   ├── repository/                 # PokemonRepository, TrainerRepository
│   │   └── model/                      # Pokemon, Stats, PokemonType, Trainer
│   ├── src/main/resources/
│   │   ├── application.properties      # Configuração (lê as variáveis do .env)
│   │   └── data/Script_Pokedex.sql     # Cópia do script usada na carga inicial
│   ├── .env.example                    # Modelo das variáveis de conexão
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── services/api.ts             # Todas as chamadas à API REST
│   │   ├── components/                 # Cards, detalhes, formulário, comparador, treinadores
│   │   ├── types/pokemon.ts            # Interfaces no mesmo formato do JSON da API
│   │   └── App.tsx
│   ├── vite.config.ts                  # Proxy /api → localhost:8080
│   └── package.json
└── Script_Pokedex.sql                  # Script original fornecido na atividade
```

---

## 🗄️ Modelagem: do SQL para o MongoDB

O `Script_Pokedex.sql` possui 5 tabelas relacionais. Como o MongoDB não tem JOIN, as relações foram resolvidas uma única vez, durante a carga dos dados:

| Tabela no SQL | Como ficou no MongoDB |
| ------------- | --------------------- |
| `Pokemon` | Coleção `pokemons`: um documento por Pokémon, com os atributos agrupados em `stats` |
| `Types` + `Rel_Pokemon_Type` | Tipos **embutidos** no documento do Pokémon (`types`) |
| `Trainers` | Coleção `trainers` |
| `Rel_Trainer_Pokemon` | Lista `pokemonIds` dentro do treinador (**referência** aos Pokémon) |

- Os **tipos foram embutidos** porque são poucos, mudam raramente e sempre aparecem junto do Pokémon. Assim, uma única consulta já traz tudo.
- Os **treinadores guardam apenas os IDs** dos Pokémon, porque o Pokémon existe por conta própria e pode estar na equipe de mais de um treinador.

**Documento da coleção `pokemons`:**

```json
{
  "_id": 25,
  "name": "Pikachu",
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 30,
    "specialAttack": 50,
    "specialDefense": 40,
    "speed": 90
  },
  "types": [{ "id": 5, "name": "Electric" }]
}
```

**Documento da coleção `trainers`:**

```json
{
  "_id": 1,
  "name": "Ash",
  "badges": 9,
  "pokemonIds": [25, 3, 6, 9, 131, 143]
}
```

**Carga inicial:** ao iniciar, o `DataSeeder` verifica se as coleções estão vazias. Se estiverem, ele lê o `Script_Pokedex.sql`, interpreta os `INSERT`s, monta os documentos e grava tudo no MongoDB. Se já houver dados, não faz nada.

---

## ✅ Pré-requisitos

- **JDK 25**
- **Node.js 22+** (LTS) e npm
- Conta gratuita no **MongoDB Atlas**

O Maven não precisa ser instalado: o projeto usa o Maven Wrapper (`mvnw`).

---

## 🔐 Configuração do MongoDB Atlas

1. Crie um cluster gratuito (**M0**) em [cloud.mongodb.com](https://cloud.mongodb.com).
2. Em **Database & Network Access → Database Users**, crie um usuário com senha. Use uma senha só com letras e números.
3. Em **IP Access List**, adicione o seu IP ou `0.0.0.0/0`.
4. Em **Connect → Drivers → Java**, copie a connection string.
5. Na pasta `my-app/backend`, crie o arquivo `.env` a partir do modelo:

   ```powershell
   Copy-Item .env.example .env
   ```

   No Linux/macOS: `cp .env.example .env`

6. Preencha o `.env` com os seus dados:

   ```env
   MONGODB_URI=mongodb+srv://USUARIO:SENHA@SEU-CLUSTER.mongodb.net/
   MONGODB_DATABASE=pokedex
   ```

> ⚠️ O `.env` está no `.gitignore`, então **as credenciais nunca vão para o GitHub**. O `application.properties` apenas lê essas variáveis (`${MONGODB_URI}` e `${MONGODB_DATABASE}`). Também é possível defini-las como variáveis de ambiente do sistema, em vez de usar o arquivo.

---

## ▶️ Executando o backend

```powershell
cd my-app/backend
.\mvnw spring-boot:run
```

No Linux/macOS: `./mvnw spring-boot:run`

- A API fica disponível em **http://localhost:8080**.
- Na primeira execução (banco vazio), o log mostra:

  ```text
  151 Pokémon inseridos a partir do Script_Pokedex.sql.
  12 treinadores inseridos a partir do Script_Pokedex.sql.
  ```

> ⚠️ Rode o comando **de dentro da pasta `backend`**, porque o `.env` é lido a partir dela.

---

## ▶️ Executando o frontend

Em outro terminal, com o backend rodando:

```powershell
cd my-app/frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**.

O Vite redireciona as chamadas `/api` para `http://localhost:8080` (proxy configurado em `vite.config.ts`), por isso não há problema de CORS.

---

## 🌐 Endpoints da API

| Método | Endpoint | Descrição | Respostas |
| ------ | -------- | --------- | --------- |
| `GET` | `/api/pokemons` | Lista todos os Pokémon (ordenados pelo número) | 200 |
| `GET` | `/api/pokemons?nome=pika` | Busca por nome (contém o texto, sem diferenciar maiúsculas) | 200 |
| `GET` | `/api/pokemons?tipo=fire` | Lista os Pokémon de um tipo | 200 |
| `GET` | `/api/pokemons/{id}` | Busca um Pokémon pelo ID | 200 / 404 |
| `POST` | `/api/pokemons` | Cadastra um Pokémon (sem ID, usa o próximo número disponível) | 201 / 400 / 409 |
| `PUT` | `/api/pokemons/{id}` | Atualiza um Pokémon | 200 / 400 / 404 |
| `DELETE` | `/api/pokemons/{id}` | Remove um Pokémon | 204 / 404 |
| `GET` | `/api/trainers` | Lista os treinadores e os IDs dos seus Pokémon | 200 |

**Exemplo de corpo para `POST` e `PUT`:**

```json
{
  "name": "Pikachu",
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 30,
    "specialAttack": 50,
    "specialDefense": 40,
    "speed": 90
  },
  "types": [{ "id": 5, "name": "Electric" }]
}
```

Os endpoints podem ser testados no Postman, Insomnia ou Thunder Client.

---

## 🎮 Funcionalidades

**Mantidas da Atividade 03, agora com dados vindos da API:**
- Pesquisa por nome ou número
- Filtro por tipo
- Ordenação (número, nome, maior HP, maior ataque)
- Favoritos, salvos no `localStorage`
- Pokémon aleatório
- Modal de detalhes com os 6 atributos e o total, com navegação anterior/próximo
- Comparador de Pokémon
- Treinadores e insígnias
- Tema claro/escuro

**Novas na Atividade 04:**
- Lista, detalhes e treinadores carregados da API REST
- Ao abrir um Pokémon, os detalhes são consultados em `GET /api/pokemons/{id}`
- **Cadastrar** Pokémon (botão **Novo**)
- **Editar** e **Excluir** Pokémon pelo modal de detalhes
- Validação no formulário e exibição das mensagens de erro da API (ex.: ID já existente)
- Aviso com botão "Tentar novamente" quando o backend está fora do ar
- Pokémon cadastrados acima do #151 aparecem com uma Pokébola como imagem

---

## 🏆 Desafios opcionais

- [x] Consultas de Pokémon por tipo (`GET /api/pokemons?tipo=`)
- [x] Persistência dos treinadores no MongoDB (coleção `trainers`)
- [x] Relação entre treinadores e Pokémon (`pokemonIds`)
- [x] Busca por nome através da API (`GET /api/pokemons?nome=`)

---

## 🔁 Repopular o banco

Para voltar aos dados originais do script:

1. No Atlas, abra **Data Explorer → pokedex**.
2. Apague as coleções `pokemons` e `trainers`.
3. Reinicie o backend. O `DataSeeder` lê o `Script_Pokedex.sql` de novo.