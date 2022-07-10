# FiTR Skills API

For in depth documentation about the entire API, please check out [The Wiki](https://github.com/FiTRSkills-com/API/wiki).

## Setup

Since the current code base is setup for production, be sure to view the index documentation in the wiki [here](https://github.com/FiTRSkills-com/API/wiki/Index) for help converting the code back to local runnable code.

Once the code base is set to run locally, we can start setting up the environment variables. Create a copy of `.env.example` and rename it `.env` in the root directory of the project.
Set all the required environment variables: `MONGO_URI`, `JWT_SECRET`, `ACCOUNT_SID`, `AUTH_TOKEN`, `API_KEY`, and `API_SECRET`.

You can use anything for the `JWT_SECRET` but I recommend hashing a string or creating a new hash using [nodes built in crypto](https://nodejs.org/api/crypto.html)

### Creating a JWT SECRET

If you'd like to go the route of hashing a string you can follow these steps:

1. Open a terminal or command prompt and type node.
2. Enter the command

```zsh
require('crypto').createHash('sha256').update('Your String Here').digest('hex')
```

3. The output will be your hashed string as a hex string.

If you'd like to go the route of creating a hash you can follow these (very similar) steps:

1. Open a terminal or command prompt and type node.
2. Enter the command

```zsh
require('crypto').createHash('sha256').digest('hex')
```

3. This output will be your created hash as a hex string.

## Install Dependencies

```bash
yarn install
```

## Run the Server

To run the server in development mode, run the following command:

```bash
yarn dev
```

To run the server in production mode, run the following command:

```bash
yarn start
```

## Testing the Server

To run tests you can run one of two commands:

```bash
yarn test
```

or for code coverage

```bash
yarn test:cc
```
