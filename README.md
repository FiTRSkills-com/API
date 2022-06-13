# FiTR Skills API

## Setup

Create a copy of `.env.example` and rename it to `.env` in the root directory of the project. Set the `MONGO_URI` environment variable to the URI of the MongoDB database.

```
MONGO_URI=mongodb+srv://<username>:<password>@...
JWT_SECRET=supersecretstring...
```

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
