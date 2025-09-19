const TelegramBot = require("node-telegram-bot-api")

// Bot configuration
const BOT_TOKEN = "8363752447:AAHzgO58VhTfLVKoLK076XHE1twF-RqUoOM"
const ADMIN_ID = "6643046428"
const PRIVATE_CHANNEL_LINK = "https://t.me/+6lxklXLAoeo0MjBl"
const BKASH_NUMBER = "01745715199"
const NAGAD_NUMBER = "01610916777"

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

// In-memory storage for user sessions (in production, use a database)
const userSessions = new Map()

// Subscription plans
const SUBSCRIPTION_PLANS = {
  "1_month": { duration: "1 মাস", price: 15, days: 30 },
  "2_month": { duration: "2 মাস", price: 25, days: 60 },
  "3_month": { duration: "3 মাস", price: 40, days: 90 },
}

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  // Initialize user session
  userSessions.set(userId, {
    chatId: chatId,
    step: "start",
    selectedPlan: null,
    paymentMethod: null,
    paymentPending: false,
  })

  const welcomeMessage = `
🎬 স্বাগতম Movies Verse BD তে! 🎬

আমাদের প্রিমিয়াম সাবস্ক্রিপশন নিয়ে উপভোগ করুন:
✅ সর্বশেষ মুভি ও সিরিজ
✅ HD কোয়ালিটি
✅ দ্রুত আপডেট
✅ বিজ্ঞাপন মুক্ত

নিচের বাটনে ক্লিক করে আপনার পছন্দের প্ল্যান বেছে নিন:
  `

  const keyboard = {
    inline_keyboard: [[{ text: "🎯 Movies Verse BD Premium", callback_data: "show_plans" }]],
  }

  bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard })
})

// Callback query handler
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message
  const chatId = msg.chat.id
  const userId = callbackQuery.from.id
  const data = callbackQuery.data

  // Get or create user session
  const session = userSessions.get(userId) || {
    chatId: chatId,
    step: "start",
    selectedPlan: null,
    paymentMethod: null,
    paymentPending: false,
  }

  switch (data) {
    case "show_plans":
      showSubscriptionPlans(chatId, userId)
      break

    case "1_month":
    case "2_month":
    case "3_month":
      session.selectedPlan = data
      session.step = "plan_selected"
      userSessions.set(userId, session)
      showPaymentMethods(chatId, data)
      break

    case "payment_bkash":
    case "payment_nagad":
      session.paymentMethod = data
      session.step = "payment_method_selected"
      userSessions.set(userId, session)
      showPaymentInstructions(chatId, userId, data)
      break

    case "payment_completed":
      handlePaymentCompleted(chatId, userId)
      break

    case "back_to_plans":
      showSubscriptionPlans(chatId, userId)
      break
  }

  // Answer callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id)
})

// Show subscription plans
function showSubscriptionPlans(chatId, userId) {
  const session = userSessions.get(userId)
  session.step = "selecting_plan"
  userSessions.set(userId, session)

  const message = `
💎 Movies Verse BD Premium Subscription 💎

আপনার পছন্দের প্ল্যান বেছে নিন:

🔥 সকল প্ল্যানে পাবেন:
• সর্বশেষ মুভি ও সিরিজ
• HD কোয়ালিটি ভিডিও
• দ্রুত আপডেট
• বিজ্ঞাপন মুক্ত অভিজ্ঞতা
  `

  const keyboard = {
    inline_keyboard: [
      [{ text: "1 মাস - ১৫ টাকা", callback_data: "1_month" }],
      [{ text: "2 মাস - ২৫ টাকা", callback_data: "2_month" }],
      [{ text: "3 মাস - ৪০ টাকা", callback_data: "3_month" }],
    ],
  }

  bot.sendMessage(chatId, message, { reply_markup: keyboard })
}

// Show payment methods
function showPaymentMethods(chatId, planKey) {
  const plan = SUBSCRIPTION_PLANS[planKey]

  const message = `
✅ আপনি বেছে নিয়েছেন: ${plan.duration} - ${plan.price} টাকা

💳 পেমেন্ট মেথড বেছে নিন:
  `

  const keyboard = {
    inline_keyboard: [
      [{ text: "📱 bKash", callback_data: "payment_bkash" }],
      [{ text: "💰 Nagad", callback_data: "payment_nagad" }],
      [{ text: "⬅️ ফিরে যান", callback_data: "back_to_plans" }],
    ],
  }

  bot.sendMessage(chatId, message, { reply_markup: keyboard })
}

// Show payment instructions
function showPaymentInstructions(chatId, userId, paymentMethod) {
  const session = userSessions.get(userId)
  const plan = SUBSCRIPTION_PLANS[session.selectedPlan]

  const issBkash = paymentMethod === "payment_bkash"
  const number = issBkash ? BKASH_NUMBER : NAGAD_NUMBER
  const methodName = issBkash ? "bKash" : "Nagad"

  session.paymentPending = true
  session.step = "awaiting_payment"
  userSessions.set(userId, session)

  const message = `
💳 ${methodName} পেমেন্ট নির্দেশনা

📋 প্ল্যান: ${plan.duration}
💰 পরিমাণ: ${plan.price} টাকা

📞 ${methodName} নম্বর: ${number}

🔄 পেমেন্ট প্রক্রিয়া:
1. ${methodName} অ্যাপ খুলুন
2. "Send Money" সিলেক্ট করুন
3. নম্বর: ${number}
4. পরিমাণ: ${plan.price} টাকা
5. পেমেন্ট সম্পন্ন করুন

⚠️ গুরুত্বপূর্ণ:
• সঠিক পরিমাণ পাঠান
• পেমেন্ট সম্পন্ন হওয়ার পর নিচের বাটনে ক্লিক করুন

পেমেন্ট সম্পন্ন হলে আপনি স্বয়ংক্রিয়ভাবে চ্যানেল লিংক পাবেন।
  `

  const keyboard = {
    inline_keyboard: [
      [{ text: "✅ পেমেন্ট সম্পন্ন হয়েছে", callback_data: "payment_completed" }],
      [{ text: "⬅️ ফিরে যান", callback_data: "show_plans" }],
    ],
  }

  bot.sendMessage(chatId, message, { reply_markup: keyboard })

  // Start payment verification process
  startPaymentVerification(userId)
}

// Handle payment completion
function handlePaymentCompleted(chatId, userId) {
  const session = userSessions.get(userId)

  if (!session.paymentPending) {
    bot.sendMessage(chatId, "❌ কোন পেমেন্ট প্রক্রিয়া চলমান নেই।")
    return
  }

  // In a real implementation, you would verify the payment here
  // For now, we'll simulate payment verification
  verifyPayment(userId).then((isVerified) => {
    if (isVerified) {
      grantChannelAccess(chatId, userId)
    } else {
      bot.sendMessage(chatId, "❌ পেমেন্ট যাচাই করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।")
    }
  })
}

// Payment verification (simplified - in production, integrate with payment gateway)
function verifyPayment(userId) {
  return new Promise((resolve) => {
    // Simulate payment verification delay
    setTimeout(() => {
      // In production, this would check with bKash/Nagad API
      // For demo purposes, we'll assume payment is successful
      resolve(true)
    }, 2000)
  })
}

// Grant channel access
function grantChannelAccess(chatId, userId) {
  const session = userSessions.get(userId)
  const plan = SUBSCRIPTION_PLANS[session.selectedPlan]

  // Update session
  session.paymentPending = false
  session.step = "subscribed"
  session.subscriptionExpiry = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000)
  userSessions.set(userId, session)

  const congratsMessage = `
🎉 অভিনন্দন! 🎉

✅ আপনার ${plan.duration} সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!

🔗 প্রাইভেট চ্যানেল লিংক:
${PRIVATE_CHANNEL_LINK}

📅 মেয়াদ: ${plan.days} দিন
⏰ মেয়াদ শেষ: ${session.subscriptionExpiry.toLocaleDateString("bn-BD")}

🎬 এখনই চ্যানেলে যোগ দিয়ে সর্বশেষ মুভি ও সিরিজ উপভোগ করুন!

ধন্যবাদ Movies Verse BD বেছে নেওয়ার জন্য! 💖
  `

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔗 চ্যানেলে যোগ দিন", url: PRIVATE_CHANNEL_LINK }],
      [{ text: "🔄 নতুন সাবস্ক্রিপশন", callback_data: "show_plans" }],
    ],
  }

  bot.sendMessage(chatId, congratsMessage, { reply_markup: keyboard })

  // Notify admin
  notifyAdmin(userId, session)
}

// Start payment verification process
function startPaymentVerification(userId) {
  const session = userSessions.get(userId)

  // Check payment status every 30 seconds for 10 minutes
  const checkInterval = setInterval(() => {
    if (!session.paymentPending) {
      clearInterval(checkInterval)
      return
    }

    // In production, implement actual payment verification
    // This is a simplified version
    console.log(`Checking payment for user ${userId}...`)
  }, 30000)

  // Stop checking after 10 minutes
  setTimeout(() => {
    clearInterval(checkInterval)
    if (session.paymentPending) {
      bot.sendMessage(session.chatId, "⏰ পেমেন্ট যাচাইয়ের সময় শেষ। অনুগ্রহ করে আবার চেষ্টা করুন।")
      session.paymentPending = false
      userSessions.set(userId, session)
    }
  }, 600000) // 10 minutes
}

// Notify admin about new subscription
function notifyAdmin(userId, session) {
  const plan = SUBSCRIPTION_PLANS[session.selectedPlan]
  const paymentMethod = session.paymentMethod === "payment_bkash" ? "bKash" : "Nagad"

  const adminMessage = `
🔔 নতুন সাবস্ক্রিপশন!

👤 ইউজার ID: ${userId}
📋 প্ল্যান: ${plan.duration}
💰 পরিমাণ: ${plan.price} টাকা
💳 পেমেন্ট: ${paymentMethod}
📅 তারিখ: ${new Date().toLocaleString("bn-BD")}
  `

  bot.sendMessage(ADMIN_ID, adminMessage)
}

// Admin commands
bot.onText(/\/admin/, (msg) => {
  const userId = msg.from.id.toString()

  if (userId !== ADMIN_ID) {
    bot.sendMessage(msg.chat.id, "❌ আপনার এই কমান্ড ব্যবহারের অনুমতি নেই।")
    return
  }

  const adminMessage = `
🔧 Admin Panel

📊 বর্তমান পরিসংখ্যান:
• মোট ইউজার: ${userSessions.size}
• সক্রিয় সাবস্ক্রিপশন: ${Array.from(userSessions.values()).filter((s) => s.step === "subscribed").length}

কমান্ড সমূহ:
/stats - বিস্তারিত পরিসংখ্যান
/broadcast [message] - সকল ইউজারে বার্তা পাঠান
  `

  bot.sendMessage(msg.chat.id, adminMessage)
})

// Stats command for admin
bot.onText(/\/stats/, (msg) => {
  const userId = msg.from.id.toString()

  if (userId !== ADMIN_ID) {
    bot.sendMessage(msg.chat.id, "❌ আপনার এই কমান্ড ব্যবহারের অনুমতি নেই।")
    return
  }

  const sessions = Array.from(userSessions.values())
  const totalUsers = sessions.length
  const subscribedUsers = sessions.filter((s) => s.step === "subscribed").length
  const pendingPayments = sessions.filter((s) => s.paymentPending).length

  const statsMessage = `
📊 বিস্তারিত পরিসংখ্যান

👥 মোট ইউজার: ${totalUsers}
✅ সক্রিয় সাবস্ক্রিপশন: ${subscribedUsers}
⏳ পেন্ডিং পেমেন্ট: ${pendingPayments}

📈 প্ল্যান অনুযায়ী:
• 1 মাস: ${sessions.filter((s) => s.selectedPlan === "1_month" && s.step === "subscribed").length}
• 2 মাস: ${sessions.filter((s) => s.selectedPlan === "2_month" && s.step === "subscribed").length}
• 3 মাস: ${sessions.filter((s) => s.selectedPlan === "3_month" && s.step === "subscribed").length}
  `

  bot.sendMessage(msg.chat.id, statsMessage)
})

// Error handling
bot.on("polling_error", (error) => {
  console.log("Polling error:", error)
})

console.log("🤖 Movies Verse BD Bot started successfully!")
console.log("Bot is now listening for messages...")
