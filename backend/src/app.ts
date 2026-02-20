import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import turmaRoutes from './routes/turmaRoutes';
import blocoRoutes from './routes/blocoRoutes';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { setupSwagger } from './docs/swagger';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ name: 'Link da Turma API', version: '1.0', status: 'ok', docs: '/api-docs' });
});

setupSwagger(app, '/api-docs');

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/blocos', blocoRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);

export default app;
