# Contributing

LoveFinder is my personal dating-app project. The code is here to view, learn from, and potentially contribute to. Contributions and suggestions are welcome, but I maintain the project on my own and may not have time to respond to or accept every contribution.

## Before contributing

- For a larger change, open an issue first to discuss it.
- For bugs, include clear steps to reproduce and relevant environment details.
- Do not include real people's profiles, photos, messages, locations, credentials, or other private information in issues, screenshots, tests, or commits.
- Do not report suspected security vulnerabilities in a public issue. See [SECURITY.md](SECURITY.md).

## Development and testing

The repository includes a NestJS backend and an Expo mobile app. The README describes local setup. The backend or other services may be broken, unavailable, or difficult to run; I do not provide a hosted backend or guarantee that the app can be used as a live service. The app is not currently promised to be published in an app store.

There is a manual API script at `scripts/test-api.ts`. It expects a local backend and demo data. The backend package also has a Jest test command, but there are no Jest test files in the repository at present. Please don’t assume the project has automated test coverage.

When submitting a change, describe how you checked it. If you could not run the app or a check, say so. Keep pull requests focused and include screenshots for UI changes when useful, using only demo or synthetic data.

## Pull requests

Explain what the change does and why. Update relevant documentation, avoid unrelated changes, and make sure your commits do not contain secrets or private data. I may ask questions or request changes during review.
