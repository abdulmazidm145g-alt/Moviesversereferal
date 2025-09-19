# Movies Verse BD Telegram Bot

একটি সম্পূর্ণ Telegram bot যা Movies Verse BD এর subscription management করে।

## Features

- 🎬 Subscription plans (1, 2, 3 months)
- 💳 bKash ও Nagad payment support
- 🔐 Automatic channel access management
- 📊 Admin panel with statistics
- 🔔 Real-time payment notifications
- 🤖 Bengali language interface
- ⚡ Automatic payment verification
- 🔒 Secure user session management

## Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the bot:
\`\`\`bash
npm start
\`\`\`

3. For development with auto-restart:
\`\`\`bash
npm run dev
\`\`\`

## Bot Configuration

- **Bot Token**: 8363752447:AAHzgO58VhTfLVKoLK076XHE1twF-RqUoOM
- **Admin ID**: 6643046428
- **Private Channel**: https://t.me/+6lxklXLAoeo0MjBl
- **bKash Number**: 01745715199
- **Nagad Number**: 01610916777

## Commands

### User Commands
- `/start` - Start the bot and show subscription options

### Admin Commands
- `/admin` - Show admin panel
- `/stats` - Show detailed statistics

## Subscription Plans

| Duration | Price | Days |
|----------|-------|------|
| 1 মাস    | ১৫ টাকা | 30   |
| 2 মাস    | ২৫ টাকা | 60   |
| 3 মাস    | ৪০ টাকা | 90   |

## Payment Methods

- **bKash**: 01745715199
- **Nagad**: 01610916777

## How It Works

1. User starts the bot with `/start`
2. Bot shows subscription plans with inline keyboard
3. User selects a plan (1, 2, or 3 months)
4. User chooses payment method (bKash/Nagad)
5. Bot provides detailed payment instructions
6. User completes payment and confirms via button
7. Bot automatically verifies payment
8. Bot grants access to private channel with congratulations
9. Admin receives notification about new subscription
10. User gets channel link and subscription details

## File Structure

\`\`\`
movies-verse-bd-bot/
├── bot.js              # Main bot logic
├── webhook-setup.js    # Webhook configuration for production
├── package.json        # Dependencies and scripts
├── README.md          # This file
└── DEPLOYMENT.md      # Deployment instructions
\`\`\`

## Deployment Options

### 1. Local Development
\`\`\`bash
npm install
npm start
\`\`\`

### 2. Heroku (Free)
- Create Heroku app
- Push code to Heroku
- Set environment variables
- Configure webhook

### 3. VPS/Server
- Upload files to server
- Install Node.js and dependencies
- Use PM2 for process management
- Configure webhook for production

## Production Setup

For production deployment:

1. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Payment Gateway**: Integrate real bKash/Nagad APIs
3. **Environment Variables**: Use .env file for sensitive data
4. **Webhook**: Configure webhook instead of polling
5. **SSL**: Ensure HTTPS for webhook endpoint
6. **Monitoring**: Add logging and error tracking
7. **Backup**: Regular data backups

## Environment Variables (Production)

\`\`\`bash
BOT_TOKEN=your_bot_token
ADMIN_ID=your_admin_id
PRIVATE_CHANNEL_LINK=your_channel_link
BKASH_NUMBER=your_bkash_number
NAGAD_NUMBER=your_nagad_number
WEBHOOK_URL=your_webhook_url
DATABASE_URL=your_database_url
\`\`\`

## Security Features

- ✅ Admin-only commands protection
- ✅ User session management
- ✅ Payment verification system
- ✅ Automatic timeout for pending payments
- ✅ Input validation and sanitization

## Troubleshooting

### Common Issues:
- **Bot not responding**: Check bot token and internet connection
- **Webhook errors**: Verify domain and SSL certificate
- **Payment issues**: Check payment numbers and verification logic
- **Admin commands not working**: Verify admin ID

### Debug Mode:
\`\`\`bash
npm run dev  # Shows detailed logs
\`\`\`

## Support

For technical support or customization:
- Contact admin via Telegram
- Check logs for error details
- Refer to DEPLOYMENT.md for setup issues

---

**Note**: This is a development version. For production use, implement proper database integration and payment gateway APIs.

## License

MIT License - Free to use and modify.
