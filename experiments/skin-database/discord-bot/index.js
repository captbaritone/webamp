const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const config = require("../config");
const logger = require("../logger");
const DiscordWinstonTransport = require("../DiscordWinstonTransport");

const CAPTBARITONE_USER_ID = "254029485463044116";

const client = new Discord.Client();

function handleStats() {}

const handlers = {
  stats: handleStats,
  help: handleHelp
};

const commands = fs
  .readdirSync(path.resolve(__dirname, "./commands"))
  .filter(file => file.endsWith(".js"))
  .map(file => {
    return require(`./commands/${file}`);
  });

for (const command of commands) {
  handlers[command.command] = command.handler;
}

async function handleHelp(message) {
  const commandHelp = commands
    .map(command => {
      return `\`!${command.command} ${command.usage || ""}\` -- ${
        command.description
      }`;
    })
    .join("\n");

  const help = `
I am a helpful bot that can do things with Winamp skins. Here are the commands I know:

${commandHelp}
\`!help\` Show this message

You can issue these commands in a DM to me or in any channel. For tasks relating to approving skins, I will respond in the #tweet-bot channel.
`.trim();
  message.channel.send(help);
}

client.on("message", async message => {
  if (message.author.bot) {
    return;
  }
  const [rawCommand, ...args] = message.content.split(" ");
  if (!rawCommand.startsWith("!")) {
    return;
  }
  const command = rawCommand.slice(1);
  logger.info(`User triggered WebampBot command`, {
    command,
    user: message.author.username,
    args,
    channel: message.channel.name || "DM"
  });
  const handler = handlers[command];
  if (handler == null) {
    logger.warn("Unknown command", {
      command,
      user: message.author.username,
      args
    });
    return;
  }
  handler(message, args);
});

client.on("error", e => {
  logger.error("The WebSocket encountered an error:", e);
});

async function main() {
  await client.login(config.discordToken);
  const captbaritone = await client.fetchUser(CAPTBARITONE_USER_ID);
  const channel = await captbaritone.createDM();
  logger.add(new DiscordWinstonTransport(channel));
}

main();
