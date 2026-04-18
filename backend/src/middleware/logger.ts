import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const statusEmoji = statusCode < 400 ? '✅' : statusCode < 500 ? '⚠️ ' : '❌';

    console.log(
      `${statusEmoji} [${timestamp}] ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | IP: ${ip}`
    );
  });

  next();
};
