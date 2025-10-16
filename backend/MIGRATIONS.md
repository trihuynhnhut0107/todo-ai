# Database Migrations

## Migration Scripts

```bash
# Generate a new migration (auto-detect entity changes)
npm run migration:generate src/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# TypeORM CLI (for advanced usage)
npm run typeorm
```
