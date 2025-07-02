export default {
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    rootDir: '.',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
};
