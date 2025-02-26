# Contributing to Samantics

Thank you for your interest in contributing to Samantics! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive when interacting with other contributors. Help create a positive environment where everyone feels welcome to participate. I personally suggest going by the [Rust Code of Conduct](https://www.rust-lang.org/policies/code-of-conduct).

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment following the instructions in the README.md

## Development Environment

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Node.js and npm (optional, if not using Bun)

### Setting Up for Development

```bash
# Clone your fork
git clone https://github.com/your-username/samantics.git
cd samantics

# Set up the API
cd api
bun install
cp .env.example .env  # Create your own .env file with appropriate credentials

# Set up the frontend
cd ../frontend
bun install
```

## Making Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the code style of the project
3. Add tests if applicable
4. Run tests to ensure your changes don't break existing functionality
5. Update documentation as needed

## Code Style

- Follow the TypeScript style already established in the project
- Use camelCase for variables and functions, PascalCase for components and interfaces
- Include explicit types for function parameters and return types
- Group imports by category (React, internal, external)
- Add JSDoc comments for complex functions

## Submitting Changes

1. Commit your changes with a clear and descriptive commit message:
   ```bash
   git commit -m "feat: add new game mode for animal words"
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a pull request on GitHub
4. In your PR description, explain the changes and the problem they solve

## Working with Data

If you're working with word lists or embeddings:

1. Refer to the README.md in the `api/data` directory for information on data processing scripts
2. Be mindful of large data files; follow the existing pattern of keeping embedding data in `.gitignore`
3. When adding new words, use the existing filter scripts to ensure quality

## Testing

- Run frontend tests with `cd frontend && bun test`
- Run API tests with `cd api && bun test`
- Test manually in both development and production modes

## Reporting Bugs

When reporting bugs, please include:

1. A clear description of the bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots or error logs if applicable
6. Your environment (OS, browser, Node version, etc.)

## Feature Requests

Feature requests are welcome! Please provide:

1. A clear description of the feature
2. Why it would be valuable
3. Any implementation ideas you have

## Questions?

If you have questions about contributing, please open an issue labeled "question" on GitHub.

Thank you for contributing to Samantics!