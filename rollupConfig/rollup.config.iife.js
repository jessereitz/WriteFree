// rollup.config.js

import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

const plugins = [
  eslint(),
  babel({
    exclude: 'node_modules/**',
  }),
];

let sourceMap = true;

if (process.env.BUILDTARGET === 'PROD') {
  plugins.push(uglify());
  sourceMap = false;
}

export default {
  entry: 'src/main.js',
  output: {
    file: 'build/js/writefree.min.js',
    format: 'iife',
    name: 'WriteFree',
    sourceMap,
  },
  plugins,
};
