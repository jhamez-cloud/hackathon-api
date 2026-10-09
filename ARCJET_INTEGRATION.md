# Arcjet Security Integration

This document explains how Arcjet security protection has been integrated into the Hackathon API project.

## Overview

Arcjet is a security platform that provides protection against common web threats including:
- Bot traffic and abuse
- Rate limiting violations
- OWASP Top 10 vulnerabilities (via Shield/WAF)
- Suspicious IP addresses

## Integration Details

### Files Modified/Added

1. **`src/common/middleware/arcjet.middleware.ts`** - Main Arcjet middleware implementation
2. **`src/main.ts`** - Updated to register Arcjet middleware globally
3. **`.env`** - Updated with actual Arcjet site key and configuration
4. **`src/test/test/test.controller.ts`** - Test endpoint to verify Arcjet is working

### Configuration

The Arcjet middleware is configured with three layers of protection:

1. **Shield (WAF)** - Protects against OWASP vulnerabilities like SQL injection, XSS, etc.
2. **Bot Detection** - Blocks known malicious bot categories (AI scrapers, botnets, unknown bots)
3. **Rate Limiting** - Limits requests to 100 per 10 minutes per IP address

### Environment Variables

The following environment variables are used:
- `ARCJET_KEY` - Your Arcjet site key (set to `ajkey_01m3082rznes9vnpnpdm6k760q`)
- `ARCJET_MODE` - Set to `DRY_RUN` by default for safe testing (change to `LIVE` for production)
- `ARCJET_ENV` - Set to `development`

### How It Works

The Arcjet middleware implements NestJS's `NestMiddleware` interface and:
1. Initializes the Arcjet SDK with your site key and configured rules
2. For each incoming request, calls `aj.protect(req)` to evaluate against security rules
3. If a request is denied, returns an appropriate HTTP response (429 for rate limiting, 403 for bot/shield blocks)
4. If allowed, calls `next()` to continue to the next middleware/route handler
5. Includes error handling to fail-open (if Arcjet fails, legitimate traffic isn't blocked)

### Testing Arcjet Integration

Test endpoints have been added:
- `GET /test/arcjet` - Returns information about the request and Arcjet configuration
- `GET /test/status` - Basic status endpoint

To verify Arcjet is working:
1. Start the application: `npm run start:dev`
2. Visit `http://localhost:3000/test/status` to confirm Arcjet is configured
3. Visit `http://localhost:3000/test/arcjet` to see Arcjet details for your request

### Moving to Production

When ready to enable active protection:
1. Change `ARCJET_MODE=DRY_RUN` to `ARCJET_MODE=LIVE` in `.env`
2. Restart the application
3. Monitor logs for any denied requests
4. Adjust rate limits or bot categories as needed based on your traffic patterns

### Security Best Practices

1. **Start in DRY_RUN mode** - Always test new rules in dry-run mode first
2. **Monitor logs** - Check application logs for Arcjet decisions
3. **Gradually tighten rules** - Start with permissive rules and gradually restrict based on observed traffic
4. **Keep SDK updated** - Regularly update the `@arcjet/node` package for latest protections

## Troubleshooting

If you encounter issues:
1. Check that `ARCJET_KEY` is correctly set in your environment
2. Verify network connectivity to Arcjet services
3. Look for error logs in the application output
4. Ensure the `@arcjet/node` package is installed (`npm ls @arcjet/node`)

For more information, visit: https://arcjet.com/docs