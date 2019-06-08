const s3 = require("../s3");

module.exports = async function() {
  return s3.getSkinToReview();
};
