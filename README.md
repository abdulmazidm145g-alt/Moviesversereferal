# Moviesversereferal
# Telegram Referral Bot

A Telegram bot that tracks user referrals with the following features:

## Features

- **Referral System**: Each user gets a unique referral link
- **Automatic Tracking**: Counts referrals for each user
- **Congratulations**: Sends messages when users get referrals
- **Task Completion**: Special message when user reaches 5 referrals
- **Admin Dashboard**: `/refcount` command for admin to see statistics

## Bot Commands

- `/start` - Start the bot and get referral link
- `/refcount` - (Admin only) View referral statistics

## Setup for Render.com

1. Push this code to GitHub
2. Connect your GitHub repo to Render.com
3. Deploy as a Web Service
4. The bot will automatically start

## Configuration

- Bot Token: Already configured
- Admin ID: Already configured
- Database: SQLite (automatically created)

## How it Works

1. User sends `/start` - gets a referral button
2. User clicks button - gets unique referral link
3. When someone joins via link - referrer gets congratulations
4. At 5 referrals - user gets completion message with link
5. Admin can check stats with `/refcount`

## Database

Uses SQLite database with two tables:
- `users` - stores user information and referral counts
- `referrals` - tracks individual referral relationships
