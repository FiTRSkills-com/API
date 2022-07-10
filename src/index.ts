import log from "./utils/log";
import makeServer from "./utils/server";
import { TestDatabase, ProductionDatabase } from "./utils/database";

const port = process.env.PORT || 3000;
const app = makeServer();

app.listen(port, async () => {
  log.info(`Server listening on port ${port}`);

  await ProductionDatabase.connect();
});
