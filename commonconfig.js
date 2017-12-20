module.exports = {
  rules: [
    {
      validation: 'camelCase',
      patterns: ['**/*'],
    },
    {
      validation: 'PascalCase',
      patterns: ['src/database/entities/**/*.ts'],
    },
    {
      validation: 'ignore',
      patterns: [
        '*/**/typings/*',
        'gql-gen.json',
        'Dockerfile*',
        'docker-compose.yml',
        'LICENSE',
        'README.md',
        'src/database/migrations/**/*.ts',
      ],
    },
  ],
};
