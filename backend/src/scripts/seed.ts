import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { pool } from '../config/database';

const linkToken = () => crypto.randomUUID().replace(/-/g, '');

const SALT_ROUNDS = 10;

async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return (result.rows as T[]) ?? [];
}

async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

async function run(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Limpando dados existentes...');
    await client.query('DELETE FROM login_logs');
    await client.query('DELETE FROM matriculas');
    await client.query('DELETE FROM materiais');
    await client.query('DELETE FROM blocos');
    await client.query('DELETE FROM turmas');
    await client.query('DELETE FROM users');

    const hash = (p: string) => bcrypt.hash(p, SALT_ROUNDS);

    console.log('Criando usuários...');
    const [adminHash, prof1Hash, prof2Hash, alunoHash] = await Promise.all([
      hash('admin123'),
      hash('professor1'),
      hash('professor2'),
      hash('aluno123'),
    ]);

    await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES
       ($1, $2, 'Admin Escola', 'sysadmin'),
       ($3, $4, 'Maria Silva', 'professor'),
       ($5, $6, 'João Santos', 'professor'),
       ($7, $8, 'Ana Costa', 'aluno'),
       ($9, $8, 'Pedro Oliveira', 'aluno'),
       ($10, $8, 'Carla Lima', 'aluno'),
       ($11, $8, 'Lucas Ferreira', 'aluno'),
       ($12, $8, 'Julia Souza', 'aluno')`,
      [
        'admin@escola.edu.br',
        adminHash,
        'maria.silva@escola.edu.br',
        prof1Hash,
        'joao.santos@escola.edu.br',
        prof2Hash,
        'ana.costa@escola.edu.br',
        alunoHash,
        'pedro.oliveira@escola.edu.br',
        'carla.lima@escola.edu.br',
        'lucas.ferreira@escola.edu.br',
        'julia.souza@escola.edu.br',
      ]
    );

    const users = await query<{ id: number; email: string; role: string }>(
      'SELECT id, email, role FROM users ORDER BY id'
    );
    const admin = users.find((u) => u.role === 'sysadmin')!;
    const prof1 = users.find((u) => u.email === 'maria.silva@escola.edu.br')!;
    const prof2 = users.find((u) => u.email === 'joao.santos@escola.edu.br')!;
    const alunos = users.filter((u) => u.role === 'aluno');

    console.log('Criando turmas, blocos e materiais...');
    const t1tok = linkToken();
    const t2tok = linkToken();
    const t3tok = linkToken();
    const t4tok = linkToken();
    await client.query(
      `INSERT INTO turmas (user_id, name, subject, slug, link_token, description) VALUES
       ($1, '9º A', 'Matemática', 'seed-matematica-9a', $3, 'Turma de Matemática - 9º ano A - 2025'),
       ($1, '9º B', 'Matemática', 'seed-matematica-9b', $4, NULL),
       ($2, '8º A', 'Português', 'seed-portugues-8a', $5, 'Língua Portuguesa - 8º ano'),
       ($2, '7º A', 'Ciências', 'seed-ciencias-7a', $6, NULL)`,
      [prof1.id, prof2.id, t1tok, t2tok, t3tok, t4tok]
    );

    const turmas = await query<{ id: number; slug: string; link_token: string; user_id: number }>(
      'SELECT id, slug, link_token, user_id FROM turmas ORDER BY id'
    );
    const [t1, t2, t3, t4] = turmas;

    await client.query(
      `INSERT INTO blocos (turma_id, name, "order") VALUES
       ($1, 'Semana 1 - Números reais', 0),
       ($1, 'Semana 2 - Equações', 1),
       ($2, 'Semana 1 - Revisão', 0),
       ($3, 'Semana 1 - Leitura', 0),
       ($3, 'Semana 2 - Produção de texto', 1),
       ($4, 'Semana 1 - Células', 0)`,
      [t1.id, t2.id, t3.id, t4.id]
    );

    const blocos = await query<{ id: number; turma_id: number }>('SELECT id, turma_id FROM blocos ORDER BY id');
    const [b1, b2, b3, b4, b5, b6] = blocos;

    await client.query(
      `INSERT INTO materiais (bloco_id, title, type, url, instruction, "order") VALUES
       ($1, 'Vídeo: Conjuntos numéricos', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Assistir antes da aula', 0),
       ($1, 'Lista de exercícios', 'exercise', 'https://example.com/exercicios', NULL, 1),
       ($2, 'Aula: Equação do 2º grau', 'video', 'https://example.com/video', 'Obrigatório', 0),
       ($3, 'Texto: Interpretação', 'reading', 'https://example.com/leitura', NULL, 0),
       ($4, 'Resumo: Célula eucariota', 'reading', 'https://example.com/celula', 'Ler até sexta', 0)`,
      [b1.id, b2.id, b4.id, b6.id]
    );

    console.log('Matriculando alunos nas turmas...');
    const matriculaValues: number[][] = [];
    turmas.forEach((turma) => {
      alunos.forEach((aluno) => {
        matriculaValues.push([aluno.id, turma.id]);
      });
    });
    for (const [userId, turmaId] of matriculaValues) {
      await client.query(
        'INSERT INTO matriculas (user_id, turma_id) VALUES ($1, $2) ON CONFLICT (user_id, turma_id) DO NOTHING',
        [userId, turmaId]
      );
    }

    console.log('Seed concluído.');
    console.log('');
    console.log('Usuários criados:');
    console.log('  Sysadmin: admin@escola.edu.br / admin123');
    console.log('  Professores: maria.silva@escola.edu.br / professor1, joao.santos@escola.edu.br / professor2');
    console.log('  Alunos (senha aluno123): ana.costa@escola.edu.br, pedro.oliveira@escola.edu.br, carla.lima@escola.edu.br, lucas.ferreira@escola.edu.br, julia.souza@escola.edu.br');
    console.log('');
    console.log('Turmas: 4 (2 de Matemática, 1 Português, 1 Ciências) com blocos e materiais. Alunos matriculados em todas.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
