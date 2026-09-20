const express = require('express');
const Page = require('../models/Page');
const SiteSettings = require('../models/SiteSettings');
const { requireAuth } = require('../middleware/auth');
const { upload, uploadToR2, deleteFromR2 } = require('../middleware/upload');

const router = express.Router();

router.get('/pages/:slug', async (req, res) => {
  const page = await Page.findOne({ where: { slug: req.params.slug } });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

router.put('/pages/:slug', requireAuth, async (req, res) => {
  const [page] = await Page.findOrCreate({
    where: { slug: req.params.slug },
    defaults: req.body,
  });
  await page.update(req.body);
  res.json(page);
});

router.post('/pages/:slug/hero-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const [page] = await Page.findOrCreate({ where: { slug: req.params.slug } });
    const previousUrl = page.heroImageUrl;
    const imageUrl = await uploadToR2(req.file, 'pages');
    await page.update({ heroImageUrl: imageUrl });
    if (previousUrl) await deleteFromR2(previousUrl);

    res.json(page);
  } catch (err) {
    console.error('[POST /pages/:slug/hero-image] Error:', err);
    res.status(500).json({ error: 'Failed to upload hero image' });
  }
});

router.get('/settings', async (req, res) => {
  const [settings] = await SiteSettings.findOrCreate({ where: {}, defaults: {} });
  res.json(settings);
});

router.put('/settings', requireAuth, async (req, res) => {
  const [settings] = await SiteSettings.findOrCreate({ where: {}, defaults: {} });
  await settings.update(req.body);
  res.json(settings);
});

module.exports = router;