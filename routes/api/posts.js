const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// Create a Post
router.post(
    '/', 
    [auth, 
     [
        check('text', 'Text is required').not().isEmpty()
     ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) 
            return res.status(400).json({ errors: errors.array() });
        
        res.json({ msg: 'Post updated' });
    }
);

module.exports = router;