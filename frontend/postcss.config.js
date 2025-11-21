export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Explicit browser support for better compatibility
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'Chrome >= 90',
        'Firefox >= 88',
        'Safari >= 14',
        'Edge >= 90',
        'iOS >= 14',
        'Android >= 90'
      ],
    },
  },
}

