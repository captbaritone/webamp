const tweet = require("../../tasks/tweet");
const { CAPTBARITONE_USER_ID } = require("../../config");

async function handler(message) {
  if (message.author.id !== CAPTBARITONE_USER_ID) {
    await message.channel.send(
      `Currently only @captbaritone can use this command`
    );
    return;
  }
  await tweet(message.client);
}

module.exports = {
  command: "tweet",
  handler,
  usage: "",
  description: "Tweet an approved skin"
};
