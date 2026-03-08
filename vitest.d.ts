/// <reference types="vitest/globals" />

import type { TestAPI } from 'vitest'

declare global {
  const vi: typeof import('vitest')['vi']
  const describe: TestAPI['describe']
  const test: TestAPI['test']
  const it: TestAPI['it']
  const expect: typeof import('vitest')['expect']
  const beforeEach: TestAPI['beforeEach']
  const beforeAll: TestAPI['beforeAll']
  const afterEach: TestAPI['afterEach']
  const afterAll: TestAPI['afterAll']
}