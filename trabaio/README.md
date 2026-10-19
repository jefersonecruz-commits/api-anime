# ThunderCats API — TypeScript

API REST com Express, TypeScript, MySQL, bcrypt e JWT.

## Requisitos
- Node.js 18+
- MySQL 8+

## Configuração
1. Execute `database/schema.sql` no MySQL.
2. Copie `.env.example` para `.env` e configure as credenciais.
3. Configure uma senha forte em `SEED_ADMIN_PASSWORD` e um `JWT_SECRET` longo e aleatório.
4. Execute `npm install`.
5. Execute `npm run seed`.
6. Desenvolvimento: `npm run dev`.
7. Compilar e iniciar: `npm run build` e `npm start`.

Não compartilhe o `.env` nem envie esse arquivo para o Git.

## Rotas

| Método | Endpoint | Acesso | Ação |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login e geração do JWT |
| GET | `/api/personagens` | Público | Listar personagens |
| GET | `/api/personagens/:id` | Público | Buscar personagem |
| POST | `/api/personagens` | JWT | Criar personagem |
| PUT | `/api/personagens/:id` | JWT | Atualizar personagem |
| DELETE | `/api/personagens/:id` | JWT | Deletar personagem |
| GET | `/api/health` | Público | Health check |

A listagem permite filtros como `/api/personagens?equipe=ThunderCats&busca=espada`.

## Login
`POST /api/auth/login` com JSON:
```json
{
  "email": "admin@thundercats.local",
  "senha": "a-senha-configurada-no-env"
}
```

Envie o token recebido em toda requisição protegida:
`Authorization: Bearer SEU_TOKEN`

## Exemplo de criação
`POST /api/personagens`:
```json
{
  "nome": "Lion-O",
  "apelido": "Senhor dos ThunderCats",
  "especie": "Thundercat",
  "equipe": "ThunderCats",
  "arma_principal": "Espada Justiceira",
  "habilidade": "Liderança e sentidos aguçados",
  "descricao": "Líder dos ThunderCats.",
  "primeira_aparicao": "ThunderCats (1985)"
}
```

O middleware verifica a validade e expiração do JWT. Neste exemplo, qualquer usuário autenticado pode criar, editar e excluir. Para restringir isso a administradores, implemente uma autorização por `papel`.
