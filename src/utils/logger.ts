function timestamp() {
  return new Date().toISOString();
}

function formatMeta(meta: unknown) {
  if (meta == null) return "";
  if (meta instanceof Error) {
    return ` ${meta.message}${meta.stack ? `\n${meta.stack}` : ""}`;
  }
  if (typeof meta === "object") {
    try {
      return ` ${JSON.stringify(meta, null, 2)}`;
    } catch {
      return ` ${String(meta)}`;
    }
  }
  return ` ${String(meta)}`;
}

function buildMessage(level: string, message: string, meta?: unknown) {
  return `${timestamp()} [${level}] ${message}${formatMeta(meta)}`;
}

export const logger = {
  info(message: string, meta?: unknown) {
    console.info(buildMessage("INFO", message, meta));
  },
  warn(message: string, meta?: unknown) {
    console.warn(buildMessage("WARN", message, meta));
  },
  error(message: string, meta?: unknown) {
    console.error(buildMessage("ERROR", message, meta));
  },
  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(buildMessage("DEBUG", message, meta));
    }
  },
};

export function logError(message: string, error: unknown) {
  if (error instanceof Error) {
    logger.error(message, { message: error.message, stack: error.stack });
  } else {
    logger.error(message, error);
  }
}
