import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';

const campos = [
  'nome', 'apelido', 'especie', 'equipe', 'arma_principal',
  'habilidade', 'descricao', 'primeira_aparicao'
] as const;

type CampoPersonagem = typeof campos[number];
type DadosPersonagem = Partial<Record<CampoPersonagem, string | null>> & { nome?: string };

interface PersonagemRow extends RowDataPacket {
  id: number;
  nome: string;
}

function nomeValido(nome: unknown): nome is string {
  return typeof nome === 'string' && nome.trim().length > 0;
}

export async function listar(req: Request, res: Response): Promise<Response> {
  try {
    const equipe = typeof req.query.equipe === 'string' ? req.query.equipe : undefined;
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined;
    let sql = `SELECT p.*, u.nome AS criado_por_nome
               FROM personagens p LEFT JOIN usuarios u ON u.id = p.criado_por`;
    const where: string[] = [];
    const values: string[] = [];

    if (equipe) {
      where.push('p.equipe = ?');
      values.push(equipe);
    }
    if (busca) {
      where.push('(p.nome LIKE ? OR p.apelido LIKE ? OR p.habilidade LIKE ?)');
      const termo = `%${busca}%`;
      values.push(termo, termo, termo);
    }
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ' ORDER BY p.nome ASC';

    const [rows] = await db.execute(sql, values);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar personagens.' });
  }
}

export async function obterPorId(req: Request, res: Response): Promise<Response> {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, u.nome AS criado_por_nome
       FROM personagens p LEFT JOIN usuarios u ON u.id = p.criado_por
       WHERE p.id = ?`,
      [req.params.id]
    );
    const personagens = rows as PersonagemRow[];
    if (!personagens.length) return res.status(404).json({ erro: 'Personagem não encontrado.' });
    return res.json(personagens[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar personagem.' });
  }
}

export async function criar(req: Request, res: Response): Promise<Response> {
  const dados = (req.body || {}) as DadosPersonagem;
  if (!nomeValido(dados.nome)) {
    return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
  }
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Autenticação necessária.' });
  }

  try {
    const values = campos.map((campo) => {
      if (campo === 'especie') return dados[campo] || 'Thundercat';
      if (campo === 'equipe') return dados[campo] || 'ThunderCats';
      return dados[campo] ?? null;
    });
    const placeholders = campos.map(() => '?').join(', ');
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO personagens (${campos.join(', ')}, criado_por)
       VALUES (${placeholders}, ?)`,
      [...values, req.usuario.id]
    );
    const [rows] = await db.execute(
      'SELECT * FROM personagens WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json((rows as PersonagemRow[])[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar personagem.' });
  }
}

export async function atualizar(req: Request, res: Response): Promise<Response> {
  const dados = (req.body || {}) as DadosPersonagem;
  const permitidos = campos.filter((campo) =>
    Object.prototype.hasOwnProperty.call(dados, campo)
  );

  if (!permitidos.length) {
    return res.status(400).json({ erro: 'Envie ao menos um campo para atualizar.' });
  }
  if (Object.prototype.hasOwnProperty.call(dados, 'nome') && !nomeValido(dados.nome)) {
    return res.status(400).json({ erro: 'O campo nome não pode ficar vazio.' });
  }

  try {
    const [existentes] = await db.execute(
      'SELECT id FROM personagens WHERE id = ?',
      [req.params.id]
    );
    if (!(existentes as RowDataPacket[]).length) {
      return res.status(404).json({ erro: 'Personagem não encontrado.' });
    }

    const set = permitidos.map((campo) => `${campo} = ?`).join(', ');
    const values = permitidos.map((campo) => dados[campo] ?? null);
    await db.execute(
      `UPDATE personagens SET ${set} WHERE id = ?`,
      [...values, req.params.id]
    );
    const [rows] = await db.execute(
      'SELECT * FROM personagens WHERE id = ?',
      [req.params.id]
    );
    return res.json((rows as PersonagemRow[])[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar personagem.' });
  }
}

export async function deletar(req: Request, res: Response): Promise<Response> {
  try {
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM personagens WHERE id = ?',
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ erro: 'Personagem não encontrado.' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar personagem.' });
  }
}
