const express = require('express');
const Users = require('../model/Users');
const router = express.Router();
const upload = require('../utils/multer');
const Achievements = require('../model/Achievements');
const mongoose = require('mongoose');
router.get('/', (req, res) => {
    res.send('Achievements');    
});

router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by ID and populate the achievements array
        const user = await Users.findOne({ _id: userId }).populate('achievements.achievementId').exec();

        console.log(user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the user.' });
    }
});

router.post('/form', upload.single('img'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imgPath = req.file ? req.file.path : null;

        if (!imgPath) {
            return res.status(400).json({ error: 'Image upload failed.' });
        }

        const achievement = new Achievements({ title, description, img: imgPath });
        console.log(achievement);
        await achievement.save();

        res.status(201).json({ message: 'Achievement added successfully', achievement });

    } catch (error) {
        res.status(500).json({ error: 'Error adding achievement' });
    }
});

module.exports = router;