# Pizza-API

Very simple CRUD api for a fictional pizza service

## Setup

The setup is fairly simple:

Install the node packages using either `npm install` or `yarn install`.

## Usage

Customizing the server is possible using a `.env` file.

| Value             | Required | Type   | Default       | Description                                                                                                                              |
| ----------------- | -------- | ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| SERVER            | yes      | string | `localhost`   | The server address. Also used for CORS requests                                                                                          |
| NODE_ENV          | yes      | string | `development` | The server node env. Adds more detailed error logging to the terminal and sets CORS protocol. Can only be `development` or `production`. |
| PORT              | yes      | number | `8080`        | The port number that the server is listening on.                                                                                         |
| DATABASE_PROTOCOL | yes      | string | `mongodb`     | The database connection protocol.                                                                                                        |
| DATABASE_URL      | yes      | string | `localhost`   | The database connection url.                                                                                                             |
| DATABASE_PORT     | yes      | number | `27017`       | The database connection port.                                                                                                            |
| DATABASE_NAME     | yes      | string | `pizzaShop`   | The used mongo database name.                                                                                                            |
| DATABASE_USER     | no       | string |               | The database connection username.                                                                                                        |
| DATABASE_PASSWORD | no       | string |               | The database connection password.                                                                                                        |

If a DATABASE_USER is specified, then the DATABASE_PASSWORD also must be specified.

### Development

Run the development server using the following command:

> yarn dev

### Production

Build the production server using the following command:

> yarn build

Run the production server using the following command:

> yarn start

## Routing

The routes are documented using swagger which can be found using the following URL during development:

> http://localhost:8080/docs

During production the docs will be on the server at the same path `/docs`.

## Contributing / TODO

- Testing (unit tests? and postman/thunder client tests)
- Dockerfile
- CI/CD

## License

This project is licensed under the `no license yet` License. Will get fixed at some point in the future.
