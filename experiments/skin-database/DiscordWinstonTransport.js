const { Transport } = require("winston");

class DiscordWinstonTransport extends Transport {
  constructor(channel) {
    super();
    this._channel = channel;
  }

  async log(info, callback) {
    const { message, ...rest } = info;
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
