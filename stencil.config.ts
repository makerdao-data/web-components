import { Config } from '@stencil/core';

const esModules = [
  // dependencies of esm packages
].join('|');

export const config: Config = {
  namespace: 'web-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'jsx', 'json', 'd.ts'],
    transform: {
      '^.+\\.(ts|tsx|js|jsx|css)$': '@stencil/core/testing/jest-preprocessor',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  },
};
