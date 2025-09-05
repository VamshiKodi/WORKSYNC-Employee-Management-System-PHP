declare module 'jest-axe' {
  export interface AxeResults {
    violations: Array<{
      id: string;
      description: string;
      impact: string;
      nodes: any[];
    }>;
  }
  
  export function axe(container: Element | Document): Promise<AxeResults>;
  export const toHaveNoViolations: jest.CustomMatcher;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
