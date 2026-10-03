# REASON AXIS deployment

## Vercel

Import the GitHub repository `ghergabrieli-cyber/reason-axis` into the existing Vercel team.

Use the Next.js application at:

`apps/web`

The repository is a pnpm/Turborepo workspace and the app consumes internal workspace packages.

Required production environment variables:

- `DATABASE_URL`
- `SIMULATION_SIGNING_SECRET`

Do not commit either value.

## Neon

The Vercel Marketplace Neon resource is named:

`reason_axis`

Once Vercel injects `DATABASE_URL`, apply the versioned core schema:

```bash
pnpm --filter @reason-axis/database db:apply-core
```

The migration runner checks for the existing core schema and skips if already present.

## Deployment health

After the first deployment, request:

`/api/health`

A production-ready response requires:

- application: true
- database.configured: true
- database.reachable: true
- database.schemaReady: true
- simulationSigningSecret: true

No secret values are returned by the endpoint.
