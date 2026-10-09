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

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observer](https://observer.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
