module.exports = {
    root: true,
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    extends: ['@3rcu/eslint-config/nestjs'],
};
