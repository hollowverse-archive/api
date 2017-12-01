module.exports = {
  rules: [
    {
      validation: 'ignore',
      patterns: [
        '*/**/typings/*',
        'Dockerfile*',
        'docker-compose.yml',
        '**/LICENSE',
        '**/README.md',
      ],
    },
  ],
};
