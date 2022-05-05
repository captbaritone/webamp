// Example: Using Snowpack's built-in bundling support
export default {
    optimize: {
      bundle: true,
      minify: true,
      target: 'es2018',
      sourcemap: false,
      splitting: false,
    },
      exclude: [
        'node_modules/**/*',
        '**/readme.*',
        '*.tmp',
        '**/__tests__/**/*',
        '**/*test*.*',
        '**/clip_path.*',
        '**/GammaWebGL.*', //not yet used
        '**/virtualMachine.*', //not yet used
      ],
    mount: {
      src: "/",
      // maki: "/maki",
      assets: "/assets",
    },
  };
  