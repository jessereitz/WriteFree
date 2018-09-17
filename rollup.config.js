// rollup.config.js

import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  entry: 'src/main.js',
  dest: 'build/js/writefree.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
};
