# Jest - Hướng Dẫn Từ Cơ Bản Đến Nâng Cao

## 📚 Mục Lục

1. [Jest là gì?](#jest-là-gì)
2. [Tại sao cần Jest?](#tại-sao-cần-jest)
3. [Cài đặt Jest](#cài-đặt-jest)
4. [Cơ Bản - Viết Test Đơn Giản](#cơ-bản---viết-test-đơn-giản)
5. [Trung Bình - Mock & Async](#trung-bình---mock--async)
6. [Nâng Cao - Testing với Supabase](#nâng-cao---testing-với-supabase)
7. [Best Practices](#best-practices)

---

## Jest là gì?

**Jest** là một JavaScript Testing Framework được phát triển bởi Facebook. Nó được thiết kế để test JavaScript code, đặc biệt là React và React Native applications.

### Tính năng chính:

- ✅ **Zero Configuration**: Có thể chạy ngay sau khi cài đặt
- ✅ **Snapshot Testing**: Test UI components
- ✅ **Mocking**: Mock functions, modules, timers
- ✅ **Code Coverage**: Đo lường phần trăm code được test
- ✅ **Parallel Testing**: Chạy tests song song để tăng tốc

---

## Tại sao cần Jest?

### 1. **Phát hiện bugs sớm**

```typescript
// ❌ Code có bug
function calculateTotal(price: number, quantity: number) {
  return price * quantity; // Quên cộng tax!
}

// ✅ Test sẽ phát hiện bug
test('should calculate total with tax', () => {
  expect(calculateTotal(10, 2)).toBe(22); // Expected: 22, Got: 20
});
```

### 2. **Tự tin refactor code**

- Khi refactor, tests sẽ báo lỗi nếu phá vỡ logic cũ
- Không sợ "sửa cái này, hỏng cái kia"

### 3. **Documentation sống**

- Tests mô tả cách code hoạt động
- Dễ hiểu hơn comments

### 4. **CI/CD Integration**

- Tự động chạy tests trước khi deploy
- Đảm bảo code quality

---

## Cài Đặt Jest

### Bước 1: Cài đặt dependencies

```bash
npm install --save-dev jest jest-expo @types/jest
```

### Bước 2: Tạo `jest.config.js`

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@top/(.*)$': '<rootDir>/$1',
    '^@cmp/(.*)$': '<rootDir>/components/$1',
    '^@con/(.*)$': '<rootDir>/constants/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@hks/(.*)$': '<rootDir>/hooks/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
```

### Bước 3: Tạo `jest.setup.js`

```javascript
// Mock console để giảm noise trong test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### Bước 4: Thêm scripts vào `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Cơ Bản - Viết Test Đơn Giản

### Ví dụ 1: Test Function Đơn Giản

**File cần test:** `lib/utils/calculator.ts`

```typescript
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
```

**File test:** `lib/utils/__tests__/calculator.test.ts`

```typescript
import { add, multiply } from '../calculator';

describe('Calculator Functions', () => {
  // describe: Nhóm các test liên quan

  test('add should return sum of two numbers', () => {
    // test: Một test case cụ thể
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('multiply should return product of two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 100)).toBe(0);
  });
});
```

**Chạy test:**

```bash
npm test lib/utils/__tests__/calculator.test.ts
```

**Kết quả:**

```
PASS  lib/utils/__tests__/calculator.test.ts
  Calculator Functions
    ✓ add should return sum of two numbers (2 ms)
    ✓ multiply should return product of two numbers (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### Ví dụ 2: Test với Nhiều Test Cases

```typescript
describe('add function', () => {
  // Test case 1: Số dương
  it('should add positive numbers correctly', () => {
    expect(add(5, 3)).toBe(8);
  });

  // Test case 2: Số âm
  it('should add negative numbers correctly', () => {
    expect(add(-5, -3)).toBe(-8);
  });

  // Test case 3: Số dương và âm
  it('should add positive and negative numbers', () => {
    expect(add(5, -3)).toBe(2);
  });

  // Test case 4: Số thập phân
  it('should handle decimal numbers', () => {
    expect(add(1.5, 2.5)).toBe(4);
  });
});
```

### Ví dụ 3: Test với Matchers

```typescript
describe('Matchers Examples', () => {
  test('toBe - exact equality', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toBe('hello');
  });

  test('toEqual - deep equality', () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  test('toBeTruthy / toBeFalsy', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(1).toBeTruthy();
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
  });

  test('toContain - arrays and strings', () => {
    expect([1, 2, 3]).toContain(2);
    expect('hello world').toContain('world');
  });

  test('toMatch - regex', () => {
    expect('hello@example.com').toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('toBeGreaterThan / toBeLessThan', () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
  });
});
```

---

## Trung Bình - Mock & Async

### Ví dụ 4: Mock Functions

**File cần test:** `lib/utils/logger.ts`

```typescript
export const logger = {
  log: (...args: any[]) => {
    console.log('[LOG]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
```

**File test:**

```typescript
import { logger } from '../logger';

// Mock console để không in ra terminal khi test
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('Logger', () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
  });

  test('logger.log should call console.log', () => {
    logger.log('Test message');

    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    expect(consoleSpy.log).toHaveBeenCalledWith('[LOG]', 'Test message');
  });

  test('logger.error should call console.error', () => {
    logger.error('Error message');

    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'Error message');
  });
});
```

### Ví dụ 5: Mock Modules

**File cần test:** `features/payments/utils/paymentCaculationiStripeFee.ts`

```typescript
export const paymentCaculationStripeFee = (
  value: number,
  isUserDisplay?: boolean
) => {
  let amountInPounds = 0;
  let transactionFee = 0;
  let total = 0;

  if (isUserDisplay) {
    amountInPounds = value;
    transactionFee = value > 0 ? amountInPounds * 0.019 + 20 : 0;
    total = amountInPounds + transactionFee;
  } else {
    amountInPounds = value / 100;
    transactionFee = value > 0 ? amountInPounds * 0.019 + 0.2 : 0;
    total = amountInPounds + transactionFee;
  }

  return { amountInPounds, transactionFee, total };
};
```

**File test:**

```typescript
import { paymentCaculationStripeFee } from '../paymentCaculationiStripeFee';

describe('paymentCaculationStripeFee', () => {
  describe('when isUserDisplay is true', () => {
    it('should calculate fee for 2500 pence (25$)', () => {
      const result = paymentCaculationStripeFee(2500, true);

      expect(result.amountInPounds).toBe(2500);
      expect(result.transactionFee).toBeCloseTo(67.5, 1); // 2500 * 0.019 + 20
      expect(result.total).toBeCloseTo(2567.5, 1);
    });

    it('should return 0 fee for 0 amount', () => {
      const result = paymentCaculationStripeFee(0, true);

      expect(result.amountInPounds).toBe(0);
      expect(result.transactionFee).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('when isUserDisplay is false', () => {
    it('should convert pence to pounds and calculate fee', () => {
      const result = paymentCaculationStripeFee(2500, false);

      expect(result.amountInPounds).toBe(25); // 2500 / 100
      expect(result.transactionFee).toBeCloseTo(0.675, 2); // 25 * 0.019 + 0.2
      expect(result.total).toBeCloseTo(25.675, 2);
    });
  });
});
```

### Ví dụ 6: Test Async Functions

**File cần test:** `lib/utils/api.ts`

```typescript
export async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}
```

**File test:**

```typescript
import { fetchUserData } from '../api';

// Mock global fetch
global.fetch = jest.fn();

describe('fetchUserData', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should return user data on success', async () => {
    const mockUser = { id: '123', name: 'John' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await fetchUserData('123');

    expect(result).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith('/api/users/123');
  });

  it('should throw error on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchUserData('123')).rejects.toThrow('Failed to fetch user');
  });
});
```

---

## Nâng Cao - Testing với Supabase

### Ví dụ 7: Mock Supabase Client

**File cần test:** `features/event/api/event.ts`

```typescript
import { supabase } from '@lib/supabase';

export async function createEvent(data: CreateEventData, userId: string) {
  const { data: eventData, error } = await supabase
    .from('events')
    .insert({ ...data, created_by: userId })
    .select()
    .single();

  if (error) throw error;
  return eventData.id;
}
```

**File test:**

```typescript
import { createEvent } from '../event';
import { supabase } from '@lib/supabase';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('createEvent', () => {
  const mockUserId = 'user-123';
  const mockEventData = {
    team_id: 'team-456',
    title: 'Test Match',
    event_type: 'home_match',
    event_date: '2025-12-25',
    start_time: '14:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create event successfully', async () => {
    // Setup mock chain
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'event-789', ...mockEventData },
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const eventId = await createEvent(mockEventData, mockUserId);

    expect(eventId).toBe('event-789');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockEventData,
        created_by: mockUserId,
      })
    );
  });

  it('should throw error when database fails', async () => {
    const mockError = { message: 'Database error', code: 'PGRST116' };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    await expect(createEvent(mockEventData, mockUserId)).rejects.toEqual(
      mockError
    );
  });
});
```

---

## Best Practices

### 1. **Test Naming Convention**

```typescript
// ✅ GOOD - Mô tả rõ ràng
describe('paymentCaculationStripeFee', () => {
  it('should calculate fee correctly for 25$ (2500 pence)', () => {});
  it('should return 0 fee for 0 amount', () => {});
  it('should round total to avoid decimal pence', () => {});
});

// ❌ BAD - Không rõ ràng
describe('test', () => {
  it('works', () => {});
  it('test1', () => {});
});
```

### 2. **AAA Pattern (Arrange-Act-Assert)**

```typescript
it('should calculate total correctly', () => {
  // Arrange: Chuẩn bị data
  const price = 10;
  const quantity = 2;

  // Act: Thực hiện action
  const result = calculateTotal(price, quantity);

  // Assert: Kiểm tra kết quả
  expect(result).toBe(20);
});
```

### 3. **Test Isolation**

```typescript
describe('Calculator', () => {
  beforeEach(() => {
    // Reset state trước mỗi test
    jest.clearAllMocks();
  });

  // Mỗi test độc lập, không phụ thuộc vào test khác
  it('test 1', () => {});
  it('test 2', () => {});
});
```

### 4. **Test Edge Cases**

```typescript
describe('paymentCaculationStripeFee', () => {
  it('should handle zero amount', () => {});
  it('should handle negative amount', () => {});
  it('should handle very large amount', () => {});
  it('should handle decimal input', () => {});
});
```

---

## 📊 Test Coverage

### Xem coverage report:

```bash
npm run test:coverage
```

### Coverage goals:

- **Critical functions**: 100% (payment calculations)
- **Business logic**: 80%+
- **Utilities**: 80%+
- **UI components**: 60%+

---

## 🚀 Next Steps

1. Bắt đầu với các utility functions đơn giản
2. Sau đó test các API functions với Supabase mocks
3. Cuối cùng test các hooks và components
