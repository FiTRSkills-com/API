import { createServer } from "https";
import { readFileSync } from "fs";
import log from "./utils/log";
import makeServer from "./utils/server";
import { ProductionDatabase } from "./utils/database";

const port = process.env.PORT || 3005;
const app = makeServer();

const server = createServer(
  {
    key: readFileSync("/etc/letsencrypt/live/fitrskills.wolfyy.me/privkey.pem"),
    cert: readFileSync(
      "/etc/letsencrypt/live/fitrskills.wolfyy.me/fullchain.pem"
    ),
  },
  app
);

server.listen(port, async () => {
  log.info(`Server listening on port ${port}`);

  await ProductionDatabase.connect();
});
