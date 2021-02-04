function getSkinUploadUrl(_md5, _id) {
  return "<MOCK_S3_UPLOAD_URL>";
}

function getUploadedSkin(_md5) {
  return null;
}

module.exports = {
  getSkinUploadUrl: jest.fn(getSkinUploadUrl),
  getUploadedSkin: jest.fn(getUploadedSkin),
};
