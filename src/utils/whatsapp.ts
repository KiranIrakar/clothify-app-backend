console.log("🚀 WhatsApp service starting...");

import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const isEnabled = process.env.WHATSAPP_ENABLED === "true";

class WhatsAppClient {
  private client: Client;
  private isReady: boolean = false;

  constructor() {
    if (!isEnabled) {
      console.log("❌ WhatsApp Disabled");
      return;
    }

    console.log("📦 Initializing WhatsApp Client...");

    this.client = new Client({
      authStrategy: new LocalAuth()
    });

    this.client.on("qr", (qr) => {
      console.log("📲 Scan WhatsApp QR");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("✅ WhatsApp Ready");
      this.isReady = true;
    });

    this.client.initialize();
  }

  async sendWhatsApp(number: string, message: string) {
    if (!isEnabled) {
      console.log("⚠️ WhatsApp skipped (disabled)");
      return;
    }

    if (!this.isReady) {
      throw new Error("WhatsApp not ready");
    }

    const formatted = `${number}@c.us`;
    return await this.client.sendMessage(formatted, message);
  }
}

export const whatsappClient = new WhatsAppClient();