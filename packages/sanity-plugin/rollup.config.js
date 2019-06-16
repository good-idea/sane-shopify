import typescript from 'rollup-plugin-typescript2'
// import tsConfigPaths from 'rollup-plugin-ts-paths'
import pkg from './package.json'

export default {
  input: ['src/index.ts', 'src/schema.tsx'],
  output: {
    dir: './lib',
    format: 'es'
    // file: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }]
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'lodash-es/uniqueId'
  ],
  plugins: [
    // tsConfigPaths({
    //   // tsConfigDirectory: process.cwd(),
    // }),
    typescript({
      typescript: require('typescript')
    })
  ]
}
