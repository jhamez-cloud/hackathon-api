# Hackathon API

A NestJS TypeScript API with Prisma and Arcjet security middleware. The project currently acts as a secure starter backend with a global request guard, Prisma database access, and a small set of health/testing endpoints.

## Overview

This API is structured around a typical NestJS request lifecycle:

1. The app boots in `src/main.ts`.
2. A global Arcjet middleware runs before routing.
3. Requests are evaluated for bot traffic, shield protection, and rate limits.
4. Allowed traffic enters the Nest controller layer.
5. The app can access Postgres via Prisma services and generated Prisma client code.

## Current project structure

```text
.
├── .env                       # Local runtime environment variables
├── .gitignore
├── ARCJET_INTEGRATION.md      # Arcjet integration notes
├── TEST_ARCJET_INTEGRATION.md # Verification notes for the middleware
├── README.md                  # Project overview
├── nest-cli.json
├── package.json
├── prisma/
│   ├── migrations/
│   └── migrations_lock.toml
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts      # GET /
│   ├── app.module.ts          # Registers controllers and Prisma module
│   ├── app.service.ts         # Root payload service
│   ├── common/
│   │   └── middleware/
│   │       └── arcjet.middleware.ts
│   ├── generated/
│   │   └── prisma/             # Generated Prisma client output
│   ├── lib/
│   │   └── database/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── main.ts                # App bootstrap and global middleware registration
│   ├── prisma/
│   │   └── schema.prisma      # Prisma schema for User/Post models
│   └── test/
│       └── test
│           └── test.controller.ts
├── test/
│   └── app.e2e-spec.ts
├── test-arcjet.js             # Arcjet SDK smoke test
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── vitest.config.e2e.ts
└── package-lock.json
```

## API design flow

### 1. Bootstrap and middleware

`src/main.ts` creates the Nest application and then registers the Arcjet middleware globally:

```ts
const app = await NestFactory.create(AppModule);
app.use(new ArcjetMiddleware().use.bind(new ArcjetMiddleware()));
await app.listen(process.env.PORT ?? 3000);
```

This means every incoming request is checked before controller logic executes.

### 2. Arcjet protection layers

The middleware in `src/common/middleware/arcjet.middleware.ts` uses Arcjet with three defenses:

- `shield()` for common application-layer attack protection
- `detectBot()` to deny known AI/bot/botnet-like traffic
- `slidingWindow()` to enforce a rate limit per IP

Configuration is environment-driven:

- `ARCJET_KEY` - Arcjet site key
- `ARCJET_MODE` - `DRY_RUN` by default, `LIVE` for enforcement
- `PORT` - app port

Behavior:

- if `ARCJET_KEY` is missing, protection is skipped safely
- if a request is denied, the API responds with `429` for rate limits or `403` for bot/shield blocks
- if the Arcjet SDK errors, the app fails open so legitimate traffic is not blocked

### 3. Application routing

`src/app.module.ts` wires the main application:

```ts
@Module({
  controllers: [AppController, TestController],
  imports: [PrismaModule],
  providers: [AppService],
})
```

The app currently exposes:

- `GET /` - welcome payload from `AppController` and `AppService`
- `GET /test/status` - health/status check for the API and Arcjet config
- `GET /test/arcjet` - request metadata and Arcjet mode information

### 4. Database layer

The Prisma integration is configured in `src/lib/database/prisma.service.ts` using the Postgres adapter:

```ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
```

The Prisma schema in `src/prisma/schema.prisma` defines:

- `User` with `id`, `email`, `name`, and `posts`
- `Post` with `id`, `title`, `content`, `published`, `authorId`, and `author`

This is the current data model foundation for future CRUD endpoints.

## Current API endpoints

### Root health

```http
GET /
```

Returns a simple status payload such as:

```json
{
  "status": "I'm currently booked for the next decade in pretending to be productive.",
  "message": "The multiverse wouldn't have forgiven me if I didn't comply."
}
```

### Status check

```http
GET /test/status
```

Returns:

```json
{
  "status": "OK",
  "timestamp": "2026-10-09T00:00:00.000Z",
  "arcjetConfigured": true
}
```

### Arcjet debug check

```http
GET /test/arcjet
```

Returns request metadata including the remote IP, HTTP method, path, and current Arcjet mode.

## Local setup

```bash
npm install
```

Create a local `.env` file with the required variables:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/hackathon
ARCJET_KEY=your_arcjet_key
ARCJET_MODE=DRY_RUN
```

Then run:

```bash
npm run start:dev
```

## Useful scripts

```bash
npm run start        # start the app
npm run start:dev    # watch mode
npm run test         # run Vitest suite
npm run test:e2e     # run e2e tests
npm run build        # compile NestJS app
npm run prisma:generate
npm run prisma:studio
npm run prisma:migrate
```

## Notes

- The app is currently a secure NestJS skeleton with middleware, request validation, and database plumbing.
- It does not yet expose full CRUD endpoints for `User` and `Post` beyond the health/test surface.
- The project is set up for a next phase where the Prisma models can be surfaced through controller/service endpoints with the same security layer in place.

## Related docs

- `ARCJET_INTEGRATION.md` - Arcjet integration overview
- `TEST_ARCJET_INTEGRATION.md` - verification notes and testing flow
