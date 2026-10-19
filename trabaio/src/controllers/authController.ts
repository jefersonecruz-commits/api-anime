import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/database';

interface UsuarioRow {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  papel: 'admin' | 'editor';
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, senha } = req.body as { email?: string; senha?: string };

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe email e senha.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, nome, email, senha_hash, papel FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    const usuario = (rows as UsuarioRow[])[0];

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ erro: 'JWT_SECRET não foi configurado.' });
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel },
      secret,
      { expiresIn }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      tipo: 'Bearer',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
}
