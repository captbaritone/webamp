const tweet = require("../../tasks/tweet");
const { CAPTBARITONE_USER_ID } = require("../../config");

async function handler(message, args) {
  if (message.author.id !== CAPTBARITONE_USER_ID) {
    await message.channel.send(
      `Currently only @captbaritone can use this command`
    );
    return;
  }
  await tweet(message.client);
  client.destroy();
}

module.exports = {
  command: "tweet",
  handler,
  usage: "",
  description: "Tweet an approved skin"
};
