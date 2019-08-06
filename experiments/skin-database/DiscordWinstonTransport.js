const { Transport } = require("winston");

class DiscordWinstonTransport extends Transport {
  constructor(channel) {
    super();
    this._channel = channel;
  }

  async log(info, callback) {
    const { message } = info;
    await this._channel.send(`${message}`);
    // Perform the writing to the remote service
    callback();
  }
}

module.exports = DiscordWinstonTransport;
