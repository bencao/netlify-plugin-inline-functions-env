# netlify-plugin-inline-functions-env contributor guide

First welcome and thank you for joining to contribute to this community plugin, we're making it a better world for developers.

This document will summarize some convensions and workflows so that you can start contributing ASAP.

## Code Oraganization

Right now we have 2 main files, `index.js`, `lib.js` and one `test` folder.

For most changes we would have to touch on one of the main files and a test files.

## Development Workflow

- yarn install
- add your code
- add your test
- update CHANGELOG.md
- update README.md and manifest.yml if new options are introduced
- yarn test
- git push <your-workspace> <your-branch>
- create a PR

## Release Workflow

- ensure test is passing
- bump the version number in package.json
- create a new release [here](https://github.com/bencao/netlify-plugin-inline-functions-env/releases/new)
- the release tag should be the version we want to publish, e.g. `1.0.9`
- publish the release. the new version will be pushed to NPM automatically
- create a PR to update plugin version in netlify/plugins repo, similar to [this one](https://github.com/netlify/plugins/pull/151)
