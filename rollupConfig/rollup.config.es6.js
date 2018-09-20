// rollup.config.js

import { eslint } from 'rollup-plugin-eslint';

const plugins = [
  eslint(),
];

let sourceMap = true;

if (process.env.buildTarget === 'PROD') {
  sourceMap = false;
}

export default {
  entry: 'src/main.js',
  output: {
    file: 'build/js/writefree.es6.js',
    format: 'esm',
    name: 'WriteFree',
    sourceMap,
  },
  plugins,
};
