const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// Get a users profile
router.get('/me', auth, async (req, res) => {
    try {
        // get profile
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);
        if(!profile) {
            return res.status(400).json({ msg: 'There is not profile for this user' });
        }
        // Send back the profile
        res.json(profile)
    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// Add or Update a profile
router.post(
    '/', 
    [
        auth, 
        [ 
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills are required').not().isEmpty() 
        ]
    ], 
    async (req, res) => {
        // Check for errors
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Destructure Attributes
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // Build Profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object
        profileFields.social = {}
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            // If a profile already exists, Update it
            if(profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }
            // Create a new profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch(err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// GET all Profiles
router.get('/', async (req, res) => {
    try {
        let profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;