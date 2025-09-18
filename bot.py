import logging
import sqlite3
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import os

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "8298808592:AAGAARB2_bWJoqYPJB4uzF0lkImt3-HtKVw"
ADMIN_ID = 6643046428
COMPLETION_LINK = "https://t.me/your_channel_or_group"  # Replace with your actual link

class ReferralBot:
    def __init__(self):
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect('referrals.db')
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                referral_count INTEGER DEFAULT 0,
                referred_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create referrals table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS referrals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                referrer_id INTEGER,
                referred_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (referrer_id) REFERENCES users (user_id),
                FOREIGN KEY (referred_id) REFERENCES users (user_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_user(self, user_id, username, first_name, referred_by=None):
        """Add a new user to database"""
        conn = sqlite3.connect('referrals.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
        if cursor.fetchone():
            conn.close()
            return False
        
        # Add new user
        cursor.execute('''
            INSERT INTO users (user_id, username, first_name, referred_by)
            VALUES (?, ?, ?, ?)
        ''', (user_id, username, first_name, referred_by))
        
        # If referred by someone, add to referrals table and update count
        if referred_by:
            cursor.execute('''
                INSERT INTO referrals (referrer_id, referred_id)
                VALUES (?, ?)
            ''', (referred_by, user_id))
            
            cursor.execute('''
                UPDATE users SET referral_count = referral_count + 1
                WHERE user_id = ?
            ''', (referred_by,))
        
        conn.commit()
        conn.close()
        return True
    
    def get_referral_count(self, user_id):
        """Get referral count for a user"""
        conn = sqlite3.connect('referrals.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT referral_count FROM users WHERE user_id = ?', (user_id,))
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else 0
    
    def get_all_referral_stats(self):
        """Get all users' referral statistics"""
        conn = sqlite3.connect('referrals.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, username, first_name, referral_count
            FROM users
            WHERE referral_count > 0
            ORDER BY referral_count DESC
        ''')
        
        results = cursor.fetchall()
        conn.close()
        return results

# Initialize bot instance
referral_bot = ReferralBot()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    user = update.effective_user
    user_id = user.id
    username = user.username or "No username"
    first_name = user.first_name or "User"
    
    # Check if user came from referral link
    referred_by = None
    if context.args:
        try:
            referred_by = int(context.args[0])
        except ValueError:
            pass
    
    # Add user to database
    is_new_user = referral_bot.add_user(user_id, username, first_name, referred_by)
    
    if is_new_user and referred_by:
        # Notify referrer about new referral
        referral_count = referral_bot.get_referral_count(referred_by)
        
        try:
            if referral_count == 1:
                await context.bot.send_message(
                    referred_by,
                    f"🎉 Congratulations! You got your first referral!\n"
                    f"Total referrals: {referral_count}"
                )
            elif referral_count == 5:
                keyboard = [[InlineKeyboardButton("✅ Refer Complete", url=COMPLETION_LINK)]]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await context.bot.send_message(
                    referred_by,
                    f"🎊 Amazing! Your task is completed!\n"
                    f"You have successfully referred 5 users!\n"
                    f"Click the button below and then click 'Refer Complete' to notify admin:",
                    reply_markup=reply_markup
                )
            else:
                await context.bot.send_message(
                    referred_by,
                    f"🎉 Congratulations! You got a new referral!\n"
                    f"Total referrals: {referral_count}"
                )
        except Exception as e:
            logger.error(f"Error notifying referrer: {e}")
    
    # Create referral button
    referral_link = f"https://t.me/{context.bot.username}?start={user_id}"
    keyboard = [[InlineKeyboardButton("🔗 Get My Referral Link", callback_data=f"get_link_{user_id}")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_message = f"👋 Welcome {first_name}!\n\n"
    if is_new_user and referred_by:
        welcome_message += "✅ You joined through a referral link!\n\n"
    
    welcome_message += (
        "🎯 Start referring friends and earn rewards!\n"
        "Click the button below to get your unique referral link:"
    )
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button callbacks"""
    query = update.callback_query
    await query.answer()
    
    if query.data.startswith("get_link_"):
        user_id = int(query.data.split("_")[2])
        
        if query.from_user.id != user_id:
            await query.edit_message_text("❌ This button is not for you!")
            return
        
        referral_link = f"https://t.me/{context.bot.username}?start={user_id}"
        referral_count = referral_bot.get_referral_count(user_id)
        
        message = (
            f"🔗 Your Referral Link:\n"
            f"`{referral_link}`\n\n"
            f"📊 Your current referrals: {referral_count}\n\n"
            f"💡 Share this link with friends to earn rewards!\n"
            f"🎯 Target: 5 referrals to complete the task"
        )
        
        await query.edit_message_text(message, parse_mode='Markdown')

async def refcount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /refcount command (Admin only)"""
    if update.effective_user.id != ADMIN_ID:
        await update.message.reply_text("❌ You are not authorized to use this command.")
        return
    
    stats = referral_bot.get_all_referral_stats()
    
    if not stats:
        await update.message.reply_text("📊 No referrals found yet.")
        return
    
    message = "📊 **Referral Statistics:**\n\n"
    for user_id, username, first_name, count in stats:
        message += f"👤 {first_name} (@{username})\n"
        message += f"   ID: `{user_id}`\n"
        message += f"   Referrals: **{count}**\n\n"
    
    await update.message.reply_text(message, parse_mode='Markdown')

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """Start the bot"""
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("refcount", refcount))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    # Start the bot
    logger.info("Starting bot...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
