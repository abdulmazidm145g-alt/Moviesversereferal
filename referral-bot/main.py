import logging
from aiogram import Bot, Dispatcher, executor, types
import os

API_TOKEN = os.getenv("8298808592:AAGAARB2_bWJoqYPJB4uzF0lkImt3-HtKVw")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

# referral ডাটা সংরক্ষণ (সহজ করার জন্য dictionary ব্যবহার করছি)
referrals = {}
user_refs = {}

@dp.message_handler(commands=['start'])
async def start_cmd(message: types.Message):
    args = message.get_args()
    user_id = message.from_user.id

    if user_id not in referrals:
        referrals[user_id] = 0

    if args and args.startswith("ref"):
        referrer = int(args.replace("ref", ""))
        if referrer != user_id:
            referrals[referrer] = referrals.get(referrer, 0) + 1
            user_refs[user_id] = referrer

    await message.reply("👋 Welcome! Use /referral to get your invite link.")

@dp.message_handler(commands=['referral'])
async def referral_cmd(message: types.Message):
    user_id = message.from_user.id
    link = f"https://t.me/{(await bot.get_me()).username}?start=ref{user_id}"
    count = referrals.get(user_id, 0)
    await message.reply(f"🔗 Your referral link:\n{link}\n\n👥 Invited: {count} users")

@dp.message_handler(commands=['reflist'])
async def reflist_cmd(message: types.Message):
    if message.from_user.id != int(os.getenv("6643046428")):
        return await message.reply("❌ You are not admin.")

    text = "📊 Referral Stats:\n"
    for user, count in referrals.items():
        text += f"User {user} → {count} invited\n"
    await message.reply(text)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
