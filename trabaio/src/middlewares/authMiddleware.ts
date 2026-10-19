import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
  papel: 'admin' | 'editor';
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token de autenticação ausente.' });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ erro: 'JWT_SECRET não foi configurado.' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.usuario = {
      id: payload.id,
      email: payload.email,
      papel: payload.papel
    };
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}
