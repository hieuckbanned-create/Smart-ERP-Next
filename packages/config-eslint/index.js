module.exports = {
  extends: [
    '@antfu',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'unused-imports/no-unused-imports': 'error',
    'antfu/no-top-level-await': 'off',
    'node/prefer-global/process': 'off',
  },
}
