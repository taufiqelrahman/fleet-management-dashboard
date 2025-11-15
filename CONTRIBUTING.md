# Contributing to NextFleet

Thank you for your interest in contributing to NextFleet! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a detailed bug report including:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create a detailed enhancement request including:
   - Clear use case
   - Expected benefits
   - Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone <your-fork-url>
cd fleet-management-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

## Coding Standards

### TypeScript

- Use strict TypeScript
- Define proper types
- Avoid `any` type

### Components

- Use functional components
- Prefer Server Components
- Use Client Components only when necessary

### Styling

- Use Tailwind CSS
- Follow existing patterns
- Ensure responsive design

### Testing

- Write tests for new features
- Maintain test coverage
- Run tests before committing

## Commit Message Guidelines

```
type(scope): subject

body

footer
```

**Types:**

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

**Example:**

```
feat(vehicles): add bulk delete functionality

Implement bulk delete feature for vehicle management.
Users can now select multiple vehicles and delete them at once.

Closes #123
```

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure CI passes
4. Get code review approval
5. Squash commits if requested
6. Merge when approved

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
