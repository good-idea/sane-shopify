
<!-- toc -->
- [Setup](#setup)
- [Development](#development)
- [Pull Requests](#pull-requests)

<!-- tocstop -->
# Contributing

Thanks for your interest in making a contribution!


## Setup

To get started:

- Fork this repo
- Clone your fork: `git clone git@github.com:your-github-handle/sane-shopify`
- Install packages: `yarn install`

## Development

You can now run `yarn start` from the root directory, or within the individual package directories.

Make changes, then commit them with a commit message that matches [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines. For example:

- `git commit -m "fix(lib): fixes some bug"`
- `git commit -m "chore(repo): update dependencies"`
- `git commit -m "docs(repo): update contributors doc"`

The format of the message is `[type]([scope]): your message`

Where `scope` is one of:

- `sync-utils`, `sanity-plugin`, `server` or `types`
- `repo`: general changes to the repo that don't affect the code of the library (i.e. adding scripts, modifying configuration settings)

Changes in your commit may span multiple packages. As a general rule of thumb, if you have made any change to the `sync-utils` package, use that as the scope - it's the one that the others rely on. This will help make sure the changes you made bump all of the package versions appropriately.

And `type` is one of:

- `fix`: You fixed a bug! This increments the patch version, i.e. `1.0.1` -> `1.0.2`
- `feat`: You added a new feature! This increments the minor version, i.e. `1.0.2` -> `1.1.0`
- `refactor`: You changed some internals on existing features, but the API has not changed
- `perf`: You enhanced performance
- `style`: You updated styles (not applicable to this project)
- `test`: You updated or added tests
- `build`: Updates to build scripts, etc
- `chore`: Housekeeping, such as updating dependencies or removing unused files
- `ci`: Updates to CI configuration

If your updates change the API of the package in a way where users will need to update their usage, include `BREAKING CHANGE` as the last line in your commit message. If you do this, be sure to add a note to [MIGRATING.md](MIGRATING.md)!


## Pull Requests

Make a pull request from your updated fork and ask for a review! We will add you to the list of contributors, or you can add yourself by commenting in the PR with: `@all-contributors please add @<your-username> for <contributions>`. See a list of contribution types [here](https://allcontributors.org/docs/en/emoji-key).

