import { logger } from "./logger";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

logger.info("WhatsApp service starting...");

const isEnabled = process.env.WHATSAPP_ENABLED === "true";

class WhatsAppClient {
  private client: Client;
  private isReady: boolean = false;

  constructor() {
    if (!isEnabled) {
      logger.info("WhatsApp disabled");
      return;
    }

    logger.info("Initializing WhatsApp Client...");

    this.client = new Client({
      authStrategy: new LocalAuth()
    });

    this.client.on("qr", (qr) => {
      logger.info("Scan WhatsApp QR");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      logger.info("WhatsApp Ready");
      this.isReady = true;
    });

    this.client.on("error", (err) => {
      logger.error("WhatsApp error event", err);
    });

    try {
      this.client.initialize();
    } catch (err) {
      logger.error("WhatsApp initialization error (non-blocking)", err);
    }
  }

  async sendWhatsApp(number: string, message: string) {
    if (!isEnabled) {
      logger.warn("WhatsApp skipped");
      return;
    }

    if (!this.isReady) {
      logger.warn("WhatsApp not ready yet");
      return;
    }

    try {
      let cleanNumber = number.replace(/\D/g, "");

      if (!cleanNumber.startsWith("91")) {
        cleanNumber = "91" + cleanNumber;
      }

      const formatted = `${cleanNumber}@c.us`;

      logger.info("Sending WhatsApp message", { formatted });

      // 🔥 IMPORTANT DELAY
      await new Promise((res) => setTimeout(res, 5000));

      const res = await this.client.sendMessage(formatted, message);

      logger.info("WhatsApp sent");
      return res;

    } catch (err) {
      logger.error("WhatsApp error", err);
    }
  }
}

export const whatsappClient = new WhatsAppClient();