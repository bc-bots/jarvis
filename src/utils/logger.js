import fs from "fs";
import path from "path";

const colors = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const logFile = path.join(process.cwd(), "logs", "jarvis.log");

const MAX_LOG_SIZE = 128 * 1024 * 1024; // 128MB in bytes

const ensureLogDirectory = () => {
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

const rotateLogIfNeeded = () => {
  try {
    ensureLogDirectory();
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size >= MAX_LOG_SIZE) {
        const backupFile = `${logFile}.old`;
        if (fs.existsSync(backupFile)) {
          fs.unlinkSync(backupFile);
        }
        fs.renameSync(logFile, backupFile);
      }
    }
  } catch (error) {
    logger.err(`Failed to rotate log file: ${error.message}`);
  }
};

const formatTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )}.${now.getMilliseconds().toString().padStart(3, "0")}`;
};

const log = (type, color, ...args) => {
  rotateLogIfNeeded();
  const timestamp = formatTimestamp();
  const cleanMessage = `[${timestamp}] [${type}]: ${args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
    )
    .join(" ")}`;

  // Write clean message to file
  fs.appendFileSync(logFile, cleanMessage + "\n");

  // Colorize for console: grey timestamp + colored type with brackets
  const parts = cleanMessage.split("[");
  const coloredMessage = `${colors.gray}[${parts[1]}${colors.reset}${color}[${
    parts[2].split(":")[0]
  }${colors.reset}:${parts[2].split(":")[1]}`;
  console.log(coloredMessage);
};

export const logger = {
  sys: (...args) => log("SYS", colors.blue, ...args),
  ok: (...args) => log("OKK", colors.green, ...args),
  err: (...args) => log("ERR", colors.red, ...args),
  warn: (...args) => log("WRN", colors.yellow, ...args),
  debug: (...args) => log("DBG", colors.magenta, ...args),
  db: (...args) => log("DB", colors.cyan, ...args),
  ai: (...args) => log("AI", colors.magenta, ...args),
  discord: (...args) => log("DSC", colors.blue, ...args),
};
