# SquareMarket

A marketplace app with federation

## Deployment

### Cloud environment

Setup cloud environment

```bash
terraform apply
```

### Databases

Migrate and seed the databases

#### Accounts Database

```bash
npx --include-workspace-root knex --env accounts-production migrate:up
```

#### Advertisement Database

```bash
npx --include-workspace-root knex --env advertisements-production migrate:up
```

```bash
npx --include-workspace-root knex --env advertisements-production seed:run
```

#### Messages Database

```bash
npx --include-workspace-root knex --env messages-production migrate:up
```

### Release

Create a release to run the `release`
