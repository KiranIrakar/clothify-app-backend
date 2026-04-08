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
      console.log("⚠️ WhatsApp skipped");
      return;
    }

    if (!this.isReady) {
      console.log("❌ WhatsApp not ready yet");
      return;
    }

    try {
      let cleanNumber = number.replace(/\D/g, "");

      if (!cleanNumber.startsWith("91")) {
        cleanNumber = "91" + cleanNumber;
      }

      const formatted = `${cleanNumber}@c.us`;

      console.log("📤 Sending to:", formatted);

      // 🔥 IMPORTANT DELAY
      await new Promise((res) => setTimeout(res, 5000));

      const res = await this.client.sendMessage(formatted, message);

      console.log("✅ WhatsApp sent");
      return res;

    } catch (err) {
      console.log("❌ WhatsApp error:", err);
    }
  }
}

export const whatsappClient = new WhatsAppClient();