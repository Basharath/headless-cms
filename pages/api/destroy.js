const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloudApiKey,
  api_secret: process.env.cloudApiSecret,
  secure: true,
});

export default async function handler(req, res) {
  // eslint-disable-next-line camelcase
  const { public_id } = JSON.parse(req.body);
  const result = await cloudinary.uploader.destroy(public_id);
  return res.json(result);
}
