# Sabiá Website

## Table of Contents

- [Running the Web Server](#running-the-web-server)
- [Running the Tests](#running-the-tests)
  - [Unit Tests](#unit-tests)
  - [E2E Tests](#e2e-tests)
- [Running Storybook](#running-storybook)
- [Create Next App](#create-react-app)

## Running the Web Server

1. Rename the `.env.example` to `.env` and replace the variables values.
2. Make sure you have started the [API server](../api/README.md).
3. Install the dependencies: `npm run install`.
4. Start the server: `npm run dev` (`npm run start` for production mode).
5. The service will be available at: `http://localhost:8000`.

## Running the Tests

### Unit Tests

The web project includes unit and snapshot tests. In order to run the unit tests, run `npm run jest`. This script will run the tests and generate the code coverage.

You can run `npm run jest:watch` to watch files for changes and rerun tests related to changed files or if you want to update the snapshot files.

### E2E Tests

This project also includes E2E Tests. Take a look at the [main README file](../../README.md##e2e-tests) to learn how to achieve it.

## Running Storybook

Run `npm run storybook` to have storybook setup locally. The server will be available at `http://localhost:9009`.

## Create Next App

This project was bootstrapped with [Create Next App](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).
