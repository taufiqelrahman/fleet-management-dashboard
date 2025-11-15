# Project Dependencies

## Production Dependencies

| Package                  | Version  | Purpose                  |
| ------------------------ | -------- | ------------------------ |
| next                     | ^15.0.0  | React framework          |
| react                    | ^18.3.1  | UI library               |
| react-dom                | ^18.3.1  | React DOM renderer       |
| next-auth                | ^4.24.5  | Authentication           |
| @tanstack/react-query    | ^5.17.0  | Data fetching & caching  |
| recharts                 | ^2.10.3  | Data visualization       |
| zod                      | ^3.22.4  | Schema validation        |
| react-hook-form          | ^7.49.2  | Form management          |
| @prisma/client           | ^5.8.0   | Database ORM             |
| node-cache               | ^5.1.2   | In-memory caching        |
| @radix-ui/\*             | Various  | Accessible UI primitives |
| lucide-react             | ^0.303.0 | Icon library             |
| clsx                     | ^2.1.0   | Conditional classnames   |
| tailwind-merge           | ^2.2.0   | Tailwind utility         |
| class-variance-authority | ^0.7.0   | Component variants       |
| date-fns                 | ^3.0.6   | Date utilities           |

## Development Dependencies

| Package             | Version  | Purpose             |
| ------------------- | -------- | ------------------- |
| typescript          | ^5.3.3   | Type checking       |
| @types/\*           | Various  | Type definitions    |
| eslint              | ^8.56.0  | Linting             |
| prettier            | Latest   | Code formatting     |
| tailwindcss         | ^3.4.0   | Utility-first CSS   |
| postcss             | ^8.4.32  | CSS processing      |
| autoprefixer        | ^10.4.16 | CSS vendor prefixes |
| prisma              | ^5.8.0   | Database toolkit    |
| jest                | ^29.7.0  | Testing framework   |
| @testing-library/\* | Various  | Testing utilities   |

## Installation Instructions

```bash
# Install all dependencies
npm install

# Or install specific dependency
npm install <package-name>

# Or install dev dependency
npm install -D <package-name>
```

## Dependency Management

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Notable Dependency Choices

### Why These Libraries?

**Next.js 15**: Latest stable version with App Router, Server Components, and excellent performance.

**TanStack Query**: Industry-standard for server state management with excellent caching and DevTools.

**ShadCN/UI**: Accessible, customizable components without runtime overhead.

**Zod**: Type-safe validation with excellent TypeScript integration.

**Prisma**: Modern ORM with type safety and great developer experience.

**Recharts**: Popular, well-maintained charting library with good TypeScript support.

## Peer Dependencies

Most dependencies will be automatically resolved. If you encounter peer dependency warnings, they are typically safe to ignore or resolve with:

```bash
npm install --legacy-peer-deps
```

## Optional Dependencies

For enhanced development experience:

```bash
# VS Code extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
```

## License Information

All dependencies are MIT licensed or have compatible licenses. See individual package licenses for details.
