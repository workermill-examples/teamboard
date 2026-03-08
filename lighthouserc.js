module.exports = {
  ci: {
    collect: {
      // URL patterns to audit
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/signup',
        'http://localhost:3000/workspaces',
      ],
      // Use local server
      startServerCommand: 'npm run build && node .next/standalone/server.js',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      // Lighthouse collection settings
      numberOfRuns: 3,
      settings: {
        // Simulate mobile device
        preset: 'desktop',
        // Additional settings for CI
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'pwa'],
      }
    },
    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],

        // PWA specific audits - all must pass
        'is-on-https': 'off', // Disabled for localhost testing
        'installable-manifest': ['error', { minScore: 1 }],
        'service-worker': ['error', { minScore: 1 }],
        'works-offline': ['error', { minScore: 1 }],
        'viewport': ['error', { minScore: 1 }],
        'apple-touch-icon': ['error', { minScore: 1 }],
        'themed-omnibox': ['error', { minScore: 1 }],
        'content-width': ['error', { minScore: 1 }],
        'maskable-icon': ['error', { minScore: 1 }],

        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Best practices
        'uses-https': 'off', // Disabled for localhost testing
        'uses-http2': 'off', // Disabled for localhost testing
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
        'csp-xss': 'warn',

        // Accessibility
        'color-contrast': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
      }
    },
    upload: {
      // Configure if using Lighthouse CI server
      target: 'temporary-public-storage',
    }
  }
};