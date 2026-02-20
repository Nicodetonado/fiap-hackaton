import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message;
  res.status(status).json({ error: message });
}
