
# CampusConnect Testing Guide

## Unit Tests

### Setup
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### Directory Structure
```
__tests__/
├── components/
│   ├── Tag.test.tsx
│   └── ErrorBoundary.test.tsx
├── services/
│   ├── MediaService.test.ts
│   └── TagService.test.ts
└── hooks/
    └── useData.test.ts
```

### Example Unit Tests

#### Components Test (Tag.test.tsx)
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Tag from '../../lib/components/Tag';

describe('Tag Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Tag label="Test Tag" />);
    expect(getByText('Test Tag')).toBeTruthy();
  });

  it('handles onPress event', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Tag label="Test Tag" onPress={onPress} />);
    fireEvent.press(getByText('Test Tag'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

#### Service Test (TagService.test.ts)
```typescript
import { TagService } from '../../lib/services/TagService';

describe('TagService', () => {
  it('fetches tags successfully', async () => {
    const tags = await TagService.getAllTags();
    expect(Array.isArray(tags)).toBeTruthy();
  });
});
```

## Integration Tests

### Setup
```bash
npm install --save-dev @testing-library/react-native jest-expo
```

### Example Integration Test

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../lib/context/AuthContext';
import PostScreen from '../screens/PostScreen';

describe('Post Creation Flow', () => {
  it('creates a post with tags', async () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <PostScreen />
      </AuthProvider>
    );

    fireEvent.changeText(getByTestId('post-content'), 'Test post content');
    fireEvent.press(getByText('Add Tags'));
    fireEvent.press(getByText('Academic'));
    fireEvent.press(getByText('Post'));

    await waitFor(() => {
      expect(getByText('Post created successfully')).toBeTruthy();
    });
  });
});
```

## E2E Tests

### Setup
```bash
npm install --save-dev detox
```

### Example E2E Test

```typescript
describe('User Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login and create a post', async () => {
    await element(by.id('email')).typeText('test@example.com');
    await element(by.id('password')).typeText('password123');
    await element(by.text('Login')).tap();
    
    await expect(element(by.text('Home'))).toBeVisible();
    
    await element(by.id('create-post')).tap();
    await element(by.id('post-content')).typeText('E2E test post');
    await element(by.text('Post')).tap();
    
    await expect(element(by.text('E2E test post'))).toBeVisible();
  });
});
```

## Performance Tests

### Setup
```bash
npm install --save-dev artillery
```

### Load Test Script (load-test.yml)
```yaml
config:
  target: "https://your-app.repl.co"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"

scenarios:
  - name: "Browse posts"
    flow:
      - get:
          url: "/api/posts"
      - think: 1
      - get:
          url: "/api/posts/{{$randomNumber(1, 100)}}"
```

### Key Performance Metrics
- Page load time: < 2s
- API response time: < 200ms
- Memory usage: < 512MB
- CPU usage: < 80%

### Running Tests

```bash
# Unit and Integration Tests
npm test

# E2E Tests
npm run e2e

# Performance Tests
npm run perf-test
```

### CI Integration

Add these tests to your CI pipeline in `.github/workflows/ci.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: npm install
      - name: Run Unit Tests
        run: npm test
      - name: Run E2E Tests
        run: npm run e2e
      - name: Run Performance Tests
        run: npm run perf-test
```

### Best Practices
1. Write tests before implementing features (TDD)
2. Keep tests focused and isolated
3. Use meaningful test descriptions
4. Mock external dependencies
5. Run tests before deployment
6. Monitor test coverage

