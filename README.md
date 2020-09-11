<p align="center">
  <a href="https://sabia-testing.herokuapp.com">
    <img alt="Sabia Platform" src="https://user-images.githubusercontent.com/12154623/89719334-9f10e980-d99d-11ea-9f57-c80e8a422a0f.png" width="200" />
  </a>
</p>
<h1 align="center">
  Sabiá Platform
</h1>

<h3 align="center">
  :bird: :palm_tree: :rocket:
</h3>
<h3 align="center">
  The Technologies Platform from the Brazilian Semiarid.
</h3>
<p align="center">
  <a href="https://github.com/ufersa/plataforma-sabia/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="Sabia Platform is released under the MIT license." />
  </a>
  <a href="https://travis-ci.com/ufersa/plataforma-sabia">
    <img src="https://travis-ci.com/ufersa/plataforma-sabia.svg?branch=master" alt="Current travis build status" />
  </a>
  <a href="https://coveralls.io/github/ufersa/plataforma-sabia?branch=master">
    <img src="https://coveralls.io/repos/github/ufersa/plataforma-sabia/badge.svg?branch=master" alt="Code coverage" />
  </a>
</p>

## Table of Contents

- [Motivation](#motivation)
- [How This Repository is Organized](#file_folder-how-this-repository-is-organized)
- [Get Up and Running](#rocket-get-up-and-running)
  - [Additional commands](#additional-commands)
- [Running the Tests](#test_tube-running-the-tests)
  - [Unit Tests](#unit-tests)
  - [E2E Tests](#e2e-tests)
- [Contributing](#handshake-contributing)
- [Credits](#credits)
  - [Contributors](#contributors)
  - [Sponsors](#sponsors)
- [License](#memo-license)

## Motivation

The Sabia Platform has been developed in order to share technologies built to achieve the needs of the Brazilian semiarid region. The technologies can be registered for free by their creators (researchers from universities, research and innovation institutes, companies and individuals). A set of intermediation services between creators and consumers are available through the platform.

## :file_folder: How This Repository is Organized

This project codebase is organized in a monorepo:

- [admin](packages/admin): it contains the project for the frontend of the platform's administrative system (built with [React Admin](https://marmelab.com/react-admin/) framework).
- [api](packages/api): includes the code for the Rest API of the platform (built with [Adonis](https://adonisjs.com/) framework).
- [web](packages/web): contains the code for the platform's website (built with [NextJs](https://nextjs.org/) framework).

## :rocket: Get Up and Running
You can run this project on your local environment by following the steps below:

1. **Clone the project.**
    ```shell
      git clone git@github.com:ufersa/plataforma-sabia.git
    ```

2. **Install the dependencies listed on each one of the application packages and link them in the repo together.**
    ```shell
      cd plataforma-sabia
      npm install
    ```

3. **Follow the instructions included in each one of the package folders.**
    - [admin](packages/admin)
    - [api](packages/api)
    - [web](packages/web)

    P.S.: Alternatively, after setting the environment variables, start both the API and the website server by running `npm run start` from the root foolder.

4. **Open the source code and start editing!**

    The site is now running on `http://localhost:8000`. Use your code editor of choice and edit the files to see. Save your changes, and the browser will update in real time!

### Additional commands

You can find additional commands in the [package.json](package.json) file:
- `start:ci`: starts both the api and web server (useful if you want to run the e2e tests locally).
- `start`: starts both the api and web server in develop mode.
- `lint`: lints the code.
- `test`: runs both the api and web package tests.
- `coverage`: collects code coverage for the api and web package files.
- `test:e2e:run`: starts the environment and runs e2e tests (used on [travis config](.travis.yml)).
- `test:e2e`: runs the e2e tests. It's useful in case you want to run the tests locally (make sure both the api and web server are up).
- `build-coverage`: merges the collected coverage (used on [travis config](.travis.yml)).

## :test_tube: Running the Tests

### Unit Tests

You cand find information on how to run the unit tests in the README files inside each one of the packages of the project.

### E2E Tests

The project uses Cypress for running the e2e tests. The main purpose is testing the whole application, by simulating the user's behavior.

In order to run the cypress tests, you need to make sure both the API and web server are up (you can use the `start:ci` script to achieve this). Once they are both running, run `npm run test:e2e` and wait the cypress GUI pops up and the tests starts. You can also open the GUI and start the tests manually by running `npx cypress open`.

Alternatively, you can run `npm run test:e2e:run` to run both the api and web server and run the tests in headless mode. Be aware that this script is going to throw an error in case the API or web server are already running.

You also need to make sure [mailcatcher](https://mailcatcher.me/) is running, since the tests depend on it. Follow the steps below:

1. Install `mailcatcher` by running `gem install mailcatcher`.
2. Run `mailcatcher` to start the tool.
3. Visit `http://localhost:1080/` to see the web interface.

All of the emails should be sent to `smtp://localhost:1025`. Therefore, you need to set the `SMTP_HOST` and` SMTP_PORT` variables in the [API .env file] (packages / api / .env.example) so that the emails are catch by MailCatcher.

## :handshake: Contributing

We'd love to have your helping hand on `sabia-platform`! If you want to contribute to the project, please take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) file. It explains the whole process and will help you get set up locally.

## Credits


### Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://lcnogueira.com"><img src="https://avatars0.githubusercontent.com/u/12154623?v=4" width="100px;" alt=""/><br /><sub><b>Luiz Cláudio</b></sub></a><br /><a href="https://github.com/ufersa/plataforma-sabia/commits?author=lcnogueira" title="Code">💻</a><a href="https://github.com/ufersa/plataforma-sabia/commits?author=lcnogueira" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

### Sponsors

Our sponsors are shown below! Dou you want to become a sponsor as well? Get in touch!

<a href="https://www.mdr.gov.br" target="_blank">
  <img src="https://pbs.twimg.com/profile_banners/281544249/1546963897/1500x500" alt="Mdr logo" width="300"/>
</a>
<a href="https://ufersa.edu.br" target="_blank">
  <img src="https://assecom.ufersa.edu.br/wp-content/uploads/sites/24/2018/01/assinatura_completa_cor_RGB.png" alt="Mdr logo" width="300"/>
</a>

## :memo: License

Sabia Platform is open source software licensed under the [MIT License](LICENSE).