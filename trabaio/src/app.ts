import express from 'express';
import authRoutes from './routes/authRoutes';
import personagemRoutes from './routes/personagemRoutes';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', universo: 'ThunderCats' });
});
app.use('/api/auth', authRoutes);
app.use('/api/personagens', personagemRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

export default app;
