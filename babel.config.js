module.exports = (api) => {
  api.cache.using(() => true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
          targets: {
            ie: '11',
          },
        },
      ],
    ],
    env: {
      test: {
        presets: ['@babel/preset-env'],
      },
    },
  };
};
