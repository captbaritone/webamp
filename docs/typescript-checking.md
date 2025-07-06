# TypeScript Checking Convention

This document describes the TypeScript checking convention established for the Webamp monorepo.

## Current Status

Each TypeScript-enabled package in the monorepo now has a consistent `type-check` script that performs type checking without emitting files.

### Package Status

#### ✅ Passing Packages
- **webamp**: Clean TypeScript compilation
- **ani-cursor**: Clean TypeScript compilation
- **webamp-docs**: Clean TypeScript compilation (after adding webamp workspace dependency)

#### ❌ Failing Packages (Need fixes)
- **skin-database**: 172 TypeScript errors (missing types, test setup issues)
- **webamp-modern**: 390+ TypeScript errors (conflicting type definitions, target issues)

## Convention

### Package-level Scripts

Each TypeScript package should have:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

**Important:** Always use `tsc --noEmit` to avoid accidentally creating JavaScript files in source directories.

### Root-level Script

The root package.json contains a centralized script that runs type checking for all currently passing packages:

```json
{
  "scripts": {
    "type-check": "pnpm --filter webamp type-check && pnpm --filter ani-cursor type-check && pnpm --filter webamp-docs type-check"
  }
}
```

### CI Integration

The CI workflow (`.github/workflows/ci.yml`) runs the centralized type-check command:

```yaml
- name: Lint
  run: |
    pnpm lint
    pnpm type-check
```

## Adding New Packages

When adding a new TypeScript package to the type-check convention:

1. Add the `type-check` script to the package's `package.json`
2. Ensure the package passes type checking: `pnpm --filter <package-name> type-check`
3. Add the package to the root `type-check` script
4. Test the full suite: `pnpm type-check`

## Fixing Failing Packages

### Common Issues

1. **Missing Jest types** (`skin-database`):
   - Install `@types/jest` and configure proper Jest setup
   - Ensure test files are properly configured

2. **Conflicting type definitions** (`webamp-modern`):
   - Multiple versions of `@types/node` causing conflicts
   - Target configuration issues (ES5 vs ES2015+)
   - Dependency type mismatches

3. **Missing dependencies**:
   - Missing type definitions for imported modules
   - Incorrect dependency references

### Recommended Fix Strategy

1. Start with packages that have fewer errors
2. Focus on one category of errors at a time
3. Update TypeScript compiler target if needed (many errors require ES2015+)
4. Ensure proper dependency management to avoid type conflicts

## Benefits

- **Consistency**: All packages use the same type-checking approach
- **CI Integration**: Automatic type checking prevents type errors from being merged
- **Developer Experience**: Simple `pnpm type-check` command for full project validation
- **Incremental**: Only includes packages that currently pass, allowing gradual improvement

## Future Work

- Fix remaining packages to include them in the type-check suite
- Consider stricter TypeScript configurations for better type safety
- Investigate automated type checking in development workflow
