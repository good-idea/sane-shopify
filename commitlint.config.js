// [
// 	'build',
// 	'ci',
// 	'chore',
// 	'docs',
// 	'feat',
// 	'fix',
// 	'perf',
// 	'refactor',
// 	'revert',
// 	'style',
// 	'test'
// ]

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      ['release', 'repo', 'server', 'sanity-plugin', 'sync-utils', 'types'],
    ],
  },
}
