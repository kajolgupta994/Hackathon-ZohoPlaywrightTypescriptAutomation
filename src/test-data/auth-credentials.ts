export interface TestUser {
  fullName: string;
  email: string;
  password: string;
  role: 'manager' | 'admin';
}

export interface TestCredentials {
  manager: TestUser;
  admin: TestUser;
}

// Generate unique credentials for each test run
const timestamp = Date.now();
const randomSuffix = Math.floor(Math.random() * 10000);

export const testCredentials: TestCredentials = {
  manager: {
    fullName: 'Manager User',
    email: `manager${timestamp}${randomSuffix}@zoho.com`,
    password: 'ManagerPass123!',
    role: 'manager'
  },
  admin: {
    fullName: 'Admin User', 
    email: `admin${timestamp}${randomSuffix}@zoho.com`,
    password: 'AdminPass123!',
    role: 'admin'
  }
};

export const invalidCredentials = {
  invalidEmail: 'invalid-email',
  shortPassword: '123',
  weakPassword: 'password',
  emptyEmail: '',
  emptyPassword: '',
  sqlInjection: "'; DROP TABLE users; --",
  xssAttempt: '<script>alert("xss")</script>',
  longEmail: 'a'.repeat(100) + '@example.com',
  longPassword: 'a'.repeat(1000)
};
