# GB-CMS Development Guide

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Contributing](#contributing)

## Development Environment Setup

### Prerequisites

Before setting up the development environment, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Version 2.30 or higher
- **VS Code**: Recommended IDE with extensions

### Required VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-css-peek",
    "ms-vscode.vscode-html-css-support"
  ]
}
```

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/gb-cms.git
   cd gb-cms
   ```

2. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Application
NEXT_PUBLIC_APP_NAME=GB-CMS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_PLUGINS=true

# External Services
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
```

## Project Structure

```
gb-cms/
├── server/                    # Next.js application
│   ├── src/
│   │   ├── app/              # App Router (Next.js 13+)
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── docs/         # Documentation
│   │   │   ├── globals.css   # Global styles
│   │   │   └── page.tsx      # Main page
│   │   ├── public/           # Static assets
│   │   └── types/            # TypeScript type definitions
│   ├── package.json          # Dependencies and scripts
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── .env.local            # Environment variables
├── player/                    # Digital signage player
├── docs/                      # Project documentation
├── .gitignore                # Git ignore rules
└── README.md                 # Project overview
```

### Key Directories

#### `/server/src/app/components/`
Contains all React components organized by functionality:

- **Core Components**: LayoutCanvas, ComponentLibrary, PropertiesPanel
- **Widget Components**: Individual widget implementations
- **System Components**: Help, Onboarding, Tutorial systems
- **Utility Components**: DragDrop, Visual editors

#### `/server/src/app/hooks/`
Custom React hooks for shared functionality:

- **useHydration**: SSR hydration handling
- **useLocalStorage**: Local storage management
- **useDebounce**: Debounced value updates
- **useMediaQuery**: Responsive breakpoint detection

#### `/server/src/app/docs/`
Comprehensive documentation:

- **User Guides**: End-user documentation
- **API Reference**: Technical documentation
- **Component Docs**: Component library documentation
- **Development Guides**: Developer resources

## Development Workflow

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new widget type"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Test additions/changes
- **chore**: Build process or auxiliary tool changes

#### Examples
```
feat(widgets): add weather widget with animated background
fix(preview): resolve positioning issues in mobile view
docs(api): update component documentation
style(ui): improve button hover states
refactor(canvas): optimize drag and drop performance
test(widgets): add unit tests for clock widget
chore(deps): update dependencies to latest versions
```

### Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Build Analysis
npm run analyze      # Analyze bundle size
npm run build:analyze # Build and analyze
```

## Code Standards

### TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### ESLint Configuration

ESLint rules enforce code quality and consistency:

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

Code formatting with Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Component Standards

#### Component Structure
```tsx
// 1. Imports
import React from 'react';
import { ComponentProps } from './types';

// 2. Interface definitions
interface MyComponentProps {
  // Props definition
}

// 3. Component implementation
const MyComponent: React.FC<MyComponentProps> = ({
  // Destructured props
}) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, []);
  
  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

// 8. Default props
MyComponent.defaultProps = {
  // Default values
};

// 9. Export
export default MyComponent;
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `MyComponent`)
- **Files**: PascalCase for components (e.g., `MyComponent.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useMyHook`)
- **Variables**: camelCase (e.g., `myVariable`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MY_CONSTANT`)
- **Types/Interfaces**: PascalCase (e.g., `MyType`)

#### Props Interface
```tsx
interface ComponentProps {
  // Required props
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: number;
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  
  // Children
  children?: React.ReactNode;
  
  // Style props
  className?: string;
  style?: React.CSSProperties;
}
```

### CSS Standards

#### Tailwind CSS Usage
```tsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
  <h2 className="text-xl font-semibold text-white">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

#### Custom CSS
```css
/* Use CSS modules for component-specific styles */
.myComponent {
  @apply flex items-center space-x-2;
}

.myComponent__title {
  @apply text-lg font-medium text-slate-900;
}

.myComponent__button {
  @apply px-3 py-1 bg-blue-600 text-white rounded;
}
```

## Testing

### Testing Framework

The project uses Jest and React Testing Library:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};
```

### Writing Tests

#### Component Tests
```tsx
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<MyComponent loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### Hook Tests
```tsx
// useMyHook.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.value).toBe(1);
  });
});
```

### Test Utilities

#### Custom Render Function
```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Coverage Requirements

- **Statements**: 80% minimum
- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum

## Debugging

### Development Tools

#### React Developer Tools
Install the React Developer Tools browser extension for debugging React components.

#### VS Code Debugging
Configure VS Code for debugging:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Debugging Techniques

#### Console Logging
```tsx
// Use console.log for debugging
console.log('Component rendered with props:', props);

// Use console.group for organized logging
console.group('Widget Update');
console.log('Old state:', oldState);
console.log('New state:', newState);
console.groupEnd();
```

#### React DevTools
- **Components Tab**: Inspect component tree and props
- **Profiler Tab**: Analyze component performance
- **Hooks Tab**: Debug custom hooks

#### Browser DevTools
- **Console**: JavaScript errors and logs
- **Network**: API requests and responses
- **Elements**: DOM inspection and CSS debugging
- **Performance**: Performance profiling

### Common Debugging Scenarios

#### State Issues
```tsx
// Debug state updates
useEffect(() => {
  console.log('State updated:', state);
}, [state]);
```

#### Performance Issues
```tsx
// Debug re-renders
const MyComponent = React.memo(({ prop }) => {
  console.log('Component rendered');
  return <div>{prop}</div>;
});
```

#### Event Handling
```tsx
// Debug event handlers
const handleClick = (event) => {
  console.log('Click event:', event);
  console.log('Event target:', event.target);
  // Handle click
};
```

## Performance Optimization

### React Performance

#### Memoization
```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

#### Component Optimization
```tsx
// Use React.memo for pure components
const MyComponent = React.memo(({ prop }) => {
  return <div>{prop}</div>;
});

// Use useMemo for expensive renders
const expensiveComponent = useMemo(() => {
  return <ExpensiveComponent data={data} />;
}, [data]);
```

### Bundle Optimization

#### Code Splitting
```tsx
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

#### Dynamic Imports
```tsx
// Dynamic imports for heavy libraries
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

### Performance Monitoring

#### Web Vitals
```tsx
// Monitor Core Web Vitals
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}
```

#### Performance Profiling
```tsx
// Use React Profiler
<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## Contributing

### Pull Request Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/gb-cms.git
   cd gb-cms
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow code standards
   - Add tests
   - Update documentation

4. **Test Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

5. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create Pull Request**
   - Use descriptive title
   - Provide detailed description
   - Link related issues
   - Request code review

### Code Review Guidelines

#### For Authors
- **Self Review**: Review your own code before submitting
- **Test Coverage**: Ensure adequate test coverage
- **Documentation**: Update documentation as needed
- **Performance**: Consider performance implications

#### For Reviewers
- **Functionality**: Verify the code works as intended
- **Code Quality**: Check for code standards compliance
- **Security**: Look for security vulnerabilities
- **Performance**: Identify performance issues
- **Documentation**: Ensure documentation is updated

### Issue Reporting

#### Bug Reports
When reporting bugs, include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, version information
- **Screenshots**: Visual evidence if applicable

#### Feature Requests
When requesting features, include:
- **Description**: Clear description of the feature
- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other relevant information

---

*This development guide provides comprehensive information for contributing to GB-CMS. For additional help, see the project documentation or contact the development team.*
