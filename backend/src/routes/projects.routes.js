const express = require('express');
const { Project, ProjectImage } = require('../models/Project');
const { requireAuth } = require('../middleware/auth');
const { upload, uploadToR2, deleteFromR2 } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  const projects = await Project.findAll({
    where: { isPublished: true },
    include: [{ model: ProjectImage, as: 'images', separate: true, order: [['orderIndex', 'ASC']] }],
    order: [['orderIndex', 'ASC']],
  });
  res.json(projects);
});

router.get('/:slug', async (req, res) => {
  const project = await Project.findOne({
    where: { slug: req.params.slug },
    include: [{ model: ProjectImage, as: 'images', separate: true, order: [['orderIndex', 'ASC']] }],
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/', requireAuth, async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

router.put('/:id', requireAuth, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  await project.update(req.body);
  res.json(project);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  await project.destroy();
  res.json({ success: true });
});

router.post('/:id/cover-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const previousUrl = project.coverImageUrl;
    const imageUrl = await uploadToR2(req.file, 'projects');
    await project.update({ coverImageUrl: imageUrl });
    if (previousUrl) await deleteFromR2(previousUrl);

    res.json(project);
  } catch (err) {
    console.error('[POST /:id/cover-image] Error:', err);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Add a new gallery image to a project
router.post('/:id/images', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const imageUrl = await uploadToR2(req.file, 'projects');
    const image = await ProjectImage.create({
      projectId: req.params.id,
      imageUrl,
      caption: req.body.caption || null,
      orderIndex: req.body.orderIndex || 0,
    });
    res.status(201).json(image);
  } catch (err) {
    console.error('[POST /:id/images] Error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Replace an existing gallery image in place (same slot, new file)
router.put('/images/:imageId', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const image = await ProjectImage.findByPk(req.params.imageId);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const updates = { caption: req.body.caption ?? image.caption };

    if (req.file) {
      const previousUrl = image.imageUrl;
      updates.imageUrl = await uploadToR2(req.file, 'projects');
      if (previousUrl) await deleteFromR2(previousUrl);
    }

    await image.update(updates);
    res.json(image);
  } catch (err) {
    console.error('[PUT /images/:imageId] Error:', err);
    res.status(500).json({ error: 'Failed to replace image' });
  }
});

router.delete('/images/:imageId', requireAuth, async (req, res) => {
  const image = await ProjectImage.findByPk(req.params.imageId);
  if (!image) return res.status(404).json({ error: 'Image not found' });
  await deleteFromR2(image.imageUrl);
  await image.destroy();
  res.json({ success: true });
});

module.exports = router;