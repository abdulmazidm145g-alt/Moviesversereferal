const TelegramBot = require("node-telegram-bot-api")

// Bot configuration
const BOT_TOKEN = "8363752447:AAHzgO58VhTfLVKoLK076XHE1twF-RqUoOM"
const WEBHOOK_URL = "https://your-domain.com/webhook" // Replace with your domain

const bot = new TelegramBot(BOT_TOKEN)

// Set webhook (use this for production deployment)
async function setWebhook() {
  try {
    await bot.setWebHook(WEBHOOK_URL)
    console.log("Webhook set successfully!")
  } catch (error) {
    console.error("Error setting webhook:", error)
  }
}

// Remove webhook (use this for local development)
async function removeWebhook() {
  try {
    await bot.deleteWebHook()
    console.log("Webhook removed successfully!")
  } catch (error) {
    console.error("Error removing webhook:", error)
  }
}

// Uncomment the function you need:
// setWebhook(); // For production
// removeWebhook(); // For local development
