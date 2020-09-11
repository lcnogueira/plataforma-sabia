# Sabiá API

## Table of Contents

- [Running the API Server](#running-the-api-server)
- [Running the Tests](#running-the-tests)
- [API Documentation](#api-documentation)
- [Using Fake Values](#using-fake-values)
- [Pushing the Data to Algolia](#pushing-the-data-to-algolia)
- [Sending Emails](#sending-emails)
- [Uploading Files](#uploading-files)
- [Adonis Framework](#adonis-framework)

## Running the API Server

1. Rename the `.env.example` file to `.env` and update all of the environment variables correctly.
2. Make sure you have a MySQL database server (feel free to use docker or whatever method you prefer) up and running and update the `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD` environment variables.
3. Install the dependencies: `npm install`.
4. Run the migrations in order to create the tables:
```
npm run migration:run
```
5. Fill the database with the default values:
```
npm run seed:default
```

**If you prefer, you can [use fake values](#using-fake-values) in order to fill your application database.**

6. Make sure the `APP_KEY` variable has been filled in the `.env` file (you can run `adonis key:generate` if you want).
7. Start the server: `npm start` (`npm run dev` for develop mode).
8. The API server will be available at `http://127.0.0.1:3333`.

## Running the Tests

After updating the environment variables in the `.env.testing` file, run:
```
npm run test
```

If you want to take a look at the code coverage, run:

```
npm run coverage
```

**The API server will use `DB_USER` and `DB_PASSWORD` values set in the `.env` file in order to connect to the testing database server.**

## API Documentation

This project has been documented by using the [apiDoc](https://apidocjs.com/) library. Use the following script to generate the documentation:
```
npm run apidoc
```
After generating the documentation files, you can start the API server and visit `http://localhost:3333/apidoc` to see the documentation.

## Using Fake Values

**If you ran the default seed script before, you will receive an error when running the following script. Reset the database before running the script**

You can fill the database with fake values for testing purposes:
1. Set the [Algolia config](#pushing-the-data-to-algolia).
2. Run the following script:
```
npm run seed
```

## Pushing the Data to Algolia

In order to use algolia, you should create an account on the [Algolia website](https://www.algolia) (there is a free account option) and set the `ALGOLIA_APP_ID` (Application ID) and `ALGOLIA_ADMIN_KEY` (Admin API) variables.

The algolia index name is `searchable_data` by default, but you can replace it by setting a new `ALGOLIA_INDEX_NAME` variable value.

Before running the API server, you should push all of the database data to algolia by running the following command:
```
npm run algolia:index
```

## Sending Emails

In order to send emails, you should update the SMTP information by setting the following environment variables:

```
SMTP_PORT=
SMTP_HOST=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=noreply@plataformasabia.com.br
```

You can be free to use any email service that supports SMTP protocol (e.g.: [sendgrid](https://sendgrid.com/), [mailgun](https://www.mailgun.com/) or even [gmail](https://www.google.com/intl/pt/gmail/about/#)).

## Uploading Files

You should update the `UPLOADS_PATH` environment variable to be able to upload files:
```shell
UPLOADS_PATH=resources/uploads
```

For running the tests, you should set the same environment variable (with a differente value) in the `.env.testing` file:
```
UPLOADS_PATH=resources/uploads-testing
```

## Adonis Framework

This project was bootstrapped by using the [Adonis Framework](https://adonisjs.com/docs/4.1/installation).