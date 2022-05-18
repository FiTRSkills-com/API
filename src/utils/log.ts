import pino from "pino";
import dayjs from "dayjs";

/**
 * Logger
 */
const log = pino({
  transport: {
    target: "pino-pretty",
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format("HH:mm:ss")}"`,
});

export default log;
