import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

export async function POST(request: Request) {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

  try {
    const { message } = await request.json();

    const chatId = '919089398';

    await bot.telegram.sendMessage(chatId, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}