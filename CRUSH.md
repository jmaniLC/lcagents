# CRUSH.md - Agent Instructions

This document outlines the essential commands and coding conventions for this repository.

## Commands

- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Lint (fix):** `npm run lint:fix`
- **Format:** `npm run format`
- **Test:** `npm run test`
- **Test (single file):** `npm run test -- <path/to/test.ts>`
- **Test (watch):** `npm run test:watch`
- **Test (coverage):** `npm run test:coverage`

## Code Style

### Formatting
- **Framework:** Prettier (`npm run format`)
- **Line Length:** 120 characters
- **Quotes:** Single quotes
- **Semicolons:** Required
- **Tabs:** 2 spaces, no tabs
- **Trailing Commas:** ES5

### Naming Conventions
- **General:** Use descriptive, camelCase names for variables and functions.
- **Classes/Types:** Use PascalCase.
- **Constants:** Use SCREAMING_SNAKE_CASE.

### Types
- **Language:** TypeScript
- **Strictness:** Type definitions are required. Avoid `any` where possible.
- **Return Types:** Explicit function return types are preferred.

### Error Handling
- Use try/catch blocks for synchronous code that can throw errors.
- For asynchronous operations, use promises with `.catch()` or async/await with try/catch.
- Avoid non-null assertions (`!`).

### Imports
- **Organization:** Keep imports organized at the top of the file.
- **Modules:** Use ES6 module syntax (`import`/`export`).

### Additional Context
- Review `.github/copilot-instructions.md` for information on the LCAgents development workflow.
