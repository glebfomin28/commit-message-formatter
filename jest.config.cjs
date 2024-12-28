module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts','js'],
  testMatch: ['**/__tests__/**/*.[jt]s', '**/?(*.)+(spec|tests|test).[tj]s'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
};
