const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
        browser: ["MadCircusBot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("🤖 Bot conectado com sucesso!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const texto =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const from = msg.key.remoteJid;

        if (!texto) return;

        if (texto.toLowerCase() === "!ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" });
        }

        if (texto.toLowerCase() === "!menu") {
            await sock.sendMessage(from, {
                text: "🎪 *Menu MadCircus*\n\n!ping - Testar bot\n!menu - Ver menu"
            });
        }
    });
}

startBot();
