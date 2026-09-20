const express = require('express');
const SiteImage = require('../models/SiteImage');
const { requireAuth } = require('../middleware/auth');
const { upload, uploadToR2, deleteFromR2 } = require('../middleware/upload');

const router = express.Router();

// Public — frontend fetches all image slots once and keys off `key`
router.get('/', async (req, res) => {
  const images = await SiteImage.findAll();
  res.json(images);
});

router.get('/:key', async (req, res) => {
  const image = await SiteImage.findOne({ where: { key: req.params.key } });
  if (!image) return res.json({ key: req.params.key, imageUrl: null, alt: null });
  res.json(image);
});

// Admin — upload/replace the image for a given key. Creates the slot the
// first time it's used, so the admin dashboard doesn't need to pre-seed keys.
router.put('/:key', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const [image] = await SiteImage.findOrCreate({
      where: { key: req.params.key },
      defaults: { key: req.params.key },
    });

    const updates = { alt: req.body.alt ?? image.alt };

    if (req.file) {
      const previousUrl = image.imageUrl;
      updates.imageUrl = await uploadToR2(req.file, 'site-images');
      if (previousUrl) await deleteFromR2(previousUrl);
    }

    await image.update(updates);
    res.json(image);
  } catch (err) {
    console.error('[PUT /api/images/:key] Error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;