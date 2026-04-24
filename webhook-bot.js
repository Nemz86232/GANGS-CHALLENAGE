const http = require("http");

const WEBHOOK_URLS = [
  process.env.WEBHOOK_URL_1,
  process.env.WEBHOOK_URL_2,
  process.env.WEBHOOK_URL_3
].filter(Boolean);

const PORT = process.env.PORT || 3000;

const IMAGES = [
 ];

let currentImageIndex = 0;

async function sendToWebhook(webhookUrl, imageUrl) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "",
      embeds: [
        {
          title: ",
          description: `
**`,
          color: 16711680,
          image: {
            url: imageUrl
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
  try {
    const imageUrl = IMAGES[currentImageIndex];

    for (const webhookUrl of WEBHOOK_URLS) {
      try {
        await sendToWebhook(webhookUrl, imageUrl);
        console.log(
          `Message sent to webhook at ${new Date().toISOString()} using image ${currentImageIndex + 1}`
        );
      } catch (error) {
        console.error(`Error sending to ${webhookUrl}:`, error.message);
      }
    }

    currentImageIndex = (currentImageIndex + 1) % IMAGES.length;
  } catch (error) {
    console.error("Error sending webhook batch:", error.message);
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
    }, 60 * 60 * 1000);
  }, delay);
}

async function start() {
  if (WEBHOOK_URLS.length === 0) {
    console.error("Missing WEBHOOK_URL_1 / WEBHOOK_URL_2 / WEBHOOK_URL_3");
    process.exit(1);
  }

  if (!IMAGES.length) {
    console.error("No images found in IMAGES array.");
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
