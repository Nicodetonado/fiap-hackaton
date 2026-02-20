import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const spec = {
  openapi: '3.0.0',
  info: { title: 'Link da Turma API', version: '1.0' },
  servers: [{ url: '/api', description: 'API base' }],
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Registro — cria aluno',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Criado' }, 409: { description: 'Email já existe' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'user + token' }, 401: { description: 'Credenciais inválidas' } },
      },
    },
    '/auth/change-password': {
      post: {
        summary: 'Trocar senha (usuário logado)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: { 204: { description: 'Senha alterada' }, 401: { description: 'Senha atual incorreta' } },
      },
    },
    '/public/turmas/link/{linkToken}': {
      get: {
        summary: 'Turma pública por token do link (sem auth)',
        parameters: [{ name: 'linkToken', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Turma com blocos e materiais' }, 404: { description: 'Não encontrada' } },
      },
    },
    '/turmas': {
      get: {
        summary: 'Lista turmas (suas / matriculadas / todas conforme role)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de turmas' } },
      },
      post: {
        summary: 'Cria turma',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'subject'],
                properties: { name: { type: 'string' }, subject: { type: 'string' }, slug: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Turma criada' }, 403: { description: 'Sem permissão' } },
      },
    },
    '/turmas/{id}': {
      get: {
        summary: 'Turma com blocos e materiais',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Turma' }, 404: { description: 'Não encontrada' } },
      },
      put: {
        summary: 'Atualiza turma',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, subject: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Atualizada' }, 404: { description: 'Não encontrada' } },
      },
      delete: {
        summary: 'Exclui turma (cascade blocos, materiais, matrículas)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Excluída' }, 404: { description: 'Não encontrada' } },
      },
    },
    '/turmas/{id}/alunos': {
      get: {
        summary: 'Alunos matriculados na turma',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Lista de alunos' }, 404: { description: 'Turma não encontrada' } },
      },
      post: {
        summary: 'Matricula aluno na turma (por email)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string' }, name: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Aluno adicionado' }, 404: { description: 'Turma não encontrada' } },
      },
    },
    '/turmas/{id}/alunos/{userId}': {
      delete: {
        summary: 'Remove aluno da turma',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 204: { description: 'Removido' }, 404: { description: 'Não encontrado' } },
      },
    },
    '/admin/turmas': {
      get: {
        summary: 'Todas as turmas com owner — sysadmin',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista com owner' }, 403: { description: 'Acesso negado' } },
      },
    },
    '/admin/users': {
      post: {
        summary: 'Cria usuário professor ou aluno — sysadmin',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['professor', 'aluno'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado (id, email, name, role)' },
          403: { description: 'Acesso negado (apenas sysadmin)' },
          409: { description: 'Email já cadastrado' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};

export function setupSwagger(app: Express, basePath: string): void {
  app.use(basePath, swaggerUi.serve);
  app.get(basePath, swaggerUi.setup(spec, { customCss: '.swagger-ui .topbar { display: none }' }));
}
