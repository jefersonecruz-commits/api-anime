import 'express';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        email: string;
        papel: 'admin' | 'editor';
      };
    }
  }
}

export {};
