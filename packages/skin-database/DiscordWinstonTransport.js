const config = require("./config");
const { Transport } = require("winston");

class DiscordWinstonTransport extends Transport {
  constructor(channel) {
    super();
    this._channel = channel;
  }

  static async addToLogger(client, logger) {
    await client.login(config.discordToken);
    const captbaritone = await client.users.fetch(config.CAPTBARITONE_USER_ID);
    const channel = await captbaritone.createDM();
    logger.add(new DiscordWinstonTransport(channel));
  }

  async log(info, callback) {
    const { message, alert, ...rest } = info;
    if (!alert && info.level !== "error") {
      callback();
      return;
    }
    let dataString = null;
    try {
      dataString = JSON.stringify(rest, null, 2);
    } catch (e) {
      dataString = "COULD NOT STRINGIFY DATA";
    }
    await this._channel.send(`${message}
\`\`\`
${dataString}
\`\`\``);
    // Perform the writing to the remote service
    callback();
  }
}

module.exports = DiscordWinstonTransport;
