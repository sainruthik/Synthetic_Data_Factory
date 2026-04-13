import '@testing-library/jest-dom'

// Required for React 19 + Vitest: enables proper act() flushing in async tests
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
