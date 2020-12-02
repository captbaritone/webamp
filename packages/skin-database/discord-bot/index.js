const Discord = require("discord.js");
const logger = require("../logger");
const DiscordWinstonTransport = require("../DiscordWinstonTransport");

const client = new Discord.Client();

const handlers = {
  help: handleHelp,
};

const commands = [
  require("./commands/review"),
  require("./commands/screenshot"),
  require("./commands/skin"),
  require("./commands/debug"),
  require("./commands/stats"),
  require("./commands/tweet"),
];

for (const command of commands) {
  handlers[command.command] = command.handler;
}

console.log(`Bot handlers registered: ${commands.map((c) => c.command)}`);

async function handleHelp(message) {
  const commandHelp = commands
    .map((command) => {
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

client.on("message", async (message) => {
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
    channel: message.channel.name || "DM",
    alert: message.channel.name == null,
  });
  const handler = handlers[command];
  if (handler == null) {
    logger.warn("Unknown command", {
      command,
      user: message.author.username,
      args,
      alert: true,
    });
    return;
  }
  try {
    await handler(message, args);
  } catch (e) {
    logger.error("Error handling command");
    logger.error(e);
    message.channel.send(
      "Oops. Something went wrong. @captbaritone has been DMed a stack trace. Feel free to ping him to fix."
    );
  }
});

client.on("error", (e) => {
  logger.error("The WebSocket encountered an error:", e);
});

async function main() {
  DiscordWinstonTransport.addToLogger(client, logger);
}

main();
