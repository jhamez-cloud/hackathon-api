import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('test')
export class TestController {
  @Get('arcjet')
  async testArcjet(@Req() req: Request, @Res() res: Response) {
    return res.json({
      message: 'Arcjet middleware is active',
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      path: req.path,
      arcjetMode: process.env.ARCJET_MODE || 'not set'
    });
  }

  @Get('status')
  getStatus() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      arcjetConfigured: !!process.env.ARCJET_KEY
    };
  }
}