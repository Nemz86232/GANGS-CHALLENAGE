const http = require("http");

const WEBHOOK_URLS = [
  process.env.WEBHOOK_URL_1,
  process.env.WEBHOOK_URL_2,
  process.env.WEBHOOK_URL_3
].filter(Boolean);

const PORT = process.env.PORT || 3000;

const IMAGE_URL =
  "https://cdn.discordapp.com/attachments/1494029725881073771/1497263232916656198/content.png?ex=69ece28c&is=69eb910c&hm=dbe06f882809ca78c223e0d551dd8a2e0030957123b6efdb3e8442f9ae245be4&";

async function sendToWebhook(webhookUrl) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "GANGS CHALLENGE",
      embeds: [
        {
          title: "🔥 GANGS CHALLENGE",
          description: `**GANGS WITH 15–20+ ACTIVE PLAYERS**
Get **30 active today** → £10 car + starter pack

**GANGS WITH 5–15+ ACTIVE PLAYERS**
Get **30 active today** → £30 car + 3x starter packs

**20 ACTIVE**
3 VIPs + 5 Battle Pass + custom Discord role

**25 ACTIVE**
5 VIPs + 5 Battle Pass + custom Discord role

**30 ACTIVE**
7 VIPs + 7 Battle Pass + custom Discord role`,
          color: 16711680,
          image: {
            url: IMAGE_URL
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook failed: ${response.status} ${errorText}`);
  }
}

async function sendWebhookMessage() {
  for (const webhookUrl of WEBHOOK_URLS) {
    try {
      await sendToWebhook(webhookUrl);
      console.log(`Message sent at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`Error sending webhook:`, error.message);
    }
  }
}

function msUntilNextHour() {
  const now = new Date();
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next - now;
}

function startScheduler() {
  const delay = msUntilNextHour();

  console.log(`First scheduled post in ${Math.round(delay / 1000)} seconds.`);

  setTimeout(async () => {
    await sendWebhookMessage();

    setInterval(async () => {
      await sendWebhookMessage();
    }, 140 * 60 * 1000);
  }, delay);
}

async function start() {
  if (WEBHOOK_URLS.length === 0) {
    console.error("Missing WEBHOOK_URL_1 / WEBHOOK_URL_2 / WEBHOOK_URL_3");
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Health server listening on port ${PORT}`);
  });

  await sendWebhookMessage();
  startScheduler();
}

start();
