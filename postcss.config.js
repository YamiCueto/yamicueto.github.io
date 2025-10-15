module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-properties'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [
      require('@fullhuman/postcss-purgecss')({
        content: ['./**/*.html', './**/*.js'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: [
          'animate-in',
          'animate-out',
          'loading',
          'loaded',
          /data-theme/,
          /^animate-/,
          /^fade-/,
          /^slide-/
        ]
      }),
      require('cssnano')({
        preset: 'default'
      })
    ] : [])
  ]
};