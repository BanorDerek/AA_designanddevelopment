const express = require('express');
const About = require('../models/About');
const { requireAuth } = require('../middleware/auth');
const { upload, uploadToR2, deleteFromR2 } = require('../middleware/upload');

const router = express.Router();

// Public - Get about page content
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      about = await About.create({
        title: 'About',
        heroImageKey: null,
        content: 'A.A Design & Development was established in 2018...',
        sections: [],
        stats: [],
        team: [],
        coreValues: [], // Changed from 'values'
        valuesTitle: 'Our Values',
      });
    }
    
    res.json(about);
  } catch (err) {
    console.error('[GET /about] Error:', err);
    res.status(500).json({ error: 'Failed to fetch about content' });
  }
});

// Admin - Update about page content
router.put('/', requireAuth, async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      about = await About.create(req.body);
    } else {
      await about.update(req.body);
    }
    
    res.json(about);
  } catch (err) {
    console.error('[PUT /about] Error:', err);
    res.status(500).json({ error: 'Failed to update about content' });
  }
});

// Admin - Upload hero image
router.post('/hero-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    let about = await About.findOne();
    if (!about) {
      about = await About.create();
    }

    const imageKey = `about-hero-${Date.now()}`;
    const imageUrl = await uploadToR2(req.file, 'about');
    
    const SiteImage = require('../models/SiteImage');
    await SiteImage.upsert({
      key: imageKey,
      imageUrl: imageUrl,
      alt: req.body.alt || 'About hero image',
    });

    await about.update({ heroImageKey: imageKey });

    res.json({ 
      success: true, 
      imageKey: imageKey,
      imageUrl: imageUrl,
      about: about 
    });
  } catch (err) {
    console.error('[POST /about/hero-image] Error:', err);
    res.status(500).json({ error: 'Failed to upload hero image' });
  }
});

// Admin - Upload section image
router.post('/section-image/:sectionIndex', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const about = await About.findOne();
    if (!about) {
      return res.status(404).json({ error: 'About page not found' });
    }

    const sections = about.sections || [];
    const index = parseInt(req.params.sectionIndex);
    
    if (index >= sections.length) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const imageKey = `about-section-${Date.now()}`;
    const imageUrl = await uploadToR2(req.file, 'about');
    
    const SiteImage = require('../models/SiteImage');
    await SiteImage.upsert({
      key: imageKey,
      imageUrl: imageUrl,
      alt: req.body.alt || `Section ${index + 1} image`,
    });

    sections[index].imageKey = imageKey;
    await about.update({ sections: sections });

    res.json({ 
      success: true, 
      imageKey: imageKey,
      imageUrl: imageUrl,
      about: about 
    });
  } catch (err) {
    console.error('[POST /about/section-image] Error:', err);
    res.status(500).json({ error: 'Failed to upload section image' });
  }
});

// Admin - Upload team member image
router.post('/team-image/:memberIndex', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const about = await About.findOne();
    if (!about) {
      return res.status(404).json({ error: 'About page not found' });
    }

    const team = about.team || [];
    const index = parseInt(req.params.memberIndex);
    
    if (index >= team.length) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const imageKey = `about-team-${Date.now()}`;
    const imageUrl = await uploadToR2(req.file, 'about');
    
    const SiteImage = require('../models/SiteImage');
    await SiteImage.upsert({
      key: imageKey,
      imageUrl: imageUrl,
      alt: req.body.alt || team[index].name || 'Team member',
    });

    team[index].imageKey = imageKey;
    await about.update({ team: team });

    res.json({ 
      success: true, 
      imageKey: imageKey,
      imageUrl: imageUrl,
      about: about 
    });
  } catch (err) {
    console.error('[POST /about/team-image] Error:', err);
    res.status(500).json({ error: 'Failed to upload team image' });
  }
});

module.exports = router;s