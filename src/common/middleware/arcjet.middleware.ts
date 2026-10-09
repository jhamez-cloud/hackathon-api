import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import type { ArcjetMode } from '@arcjet/node';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ArcjetMiddleware implements NestMiddleware {
  private aj;
  private logger = new Logger(ArcjetMiddleware.name);
  private mode: ArcjetMode;

  constructor() {
    // Get mode from environment (default to DRY_RUN for safety)
    const modeEnv = process.env.ARCJET_MODE || 'DRY_RUN';
    this.mode = modeEnv as ArcjetMode;
    this.logger.log(`Arcjet initialized in ${this.mode} mode`);

    // Initialize Arcjet with your site key
    const siteKey = process.env.ARCJET_KEY;

    if (!siteKey) {
      this.logger.warn('ARCJET_KEY not found in environment variables. Arcjet protection disabled.');
      this.aj = null;
      return;
    }

    this.aj = arcjet({
      key: siteKey,
      characteristics: ['ip.src'], // Track by IP address
      rules: [
        // Shield protection - protects against common vulnerabilities
        shield({ mode: this.mode }),

        // Bot detection - blocks automated traffic
        detectBot({
          mode: this.mode,
          // Block known malicious bots
          deny: [
            'CATEGORY:AI', // Block AI scrapers and crawlers
            'CATEGORY:BOTNET', // Block known botnets
            'CATEGORY:UNKNOWN', // Block unknown/bot-like traffic
          ]
        }),

        // Rate limiting - prevent abuse (sliding window)
        slidingWindow({
          mode: this.mode,
          // Allow 10 requests per 10 seconds per IP
          interval: '10s',
          max: 10,
        }),
      ],
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // If Arcjet is not properly configured, skip protection
    if (!this.aj) {
      return next();
    }

    try {
      const decision = await this.aj.protect(req);

      if (decision.isDenied()) {
        this.logger.warn(
          `Request denied by Arcjet: ${req.ip} ${req.method} ${req.path} - Reason: ${decision.reason}`
        );

        // Return appropriate response based on denial reason
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded'
          });
        }

        if (decision.reason.isBot()) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Automated traffic not allowed'
          });
        }

        if (decision.reason.isShield()) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Request blocked by security policy'
          });
        }

        // Generic denial
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied'
        });
      }

      // Request is allowed, continue to next middleware
      next();
    } catch (error: any) {
      this.logger.error(`Arcjet error: ${error.message}`);
      // Fail open - if Arcjet fails, don't block legitimate traffic
      next();
    }
  }
}