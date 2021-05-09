const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const mongoose = require('mongoose');

// NEED INSERT MANY SO WE CAN SLAP X DOCS INTO DATA COLLECTION
router.post('/upload', async (req, res) => {
    console.log('Uploading tokens')
    
    // tokens is an array of objects
    console.log(tokens);
    const tokens = req.body.tokens;

    // Will need to load the map and use it to markup fields on the tokens (this will be done in another route)

    try{
        const response = await Token.insertMany(tokens)
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

// Patch replacment on one token
router.patch('/replace/:tokenId', async (req, res) => {
    try{
        const updatedReponse = await Token.updateOne(
                                                {
                                                    _id: req.params.tokenId
                                                },
                                                {
                                                    replacement: req.body.replacement,
                                                    last_modified: Date.now()},
                                                {
                                                    upsert: true
                                                }
                                                )
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})

// Patch auxiliary on one token
router.patch('/auxiliary/:tokenId', async (req, res) => {
    // Takes in field, value pair where the field is the axuiliary information key
    console.log('Patching axuiliary information')
    // console.log(req.body);
    try{
        const updatedReponse = await Token.updateOne(
                                                {
                                                    _id: req.params.tokenId
                                                },
                                                {
                                                    [req.body.field]: req.body.value,
                                                    last_modified: Date.now()},
                                                {
                                                    upsert: true
                                                }
                                                )
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})


// Get one token
// router.get('/one/:tokenId', async (req, res) => {
//     try{
//         const response = await Data.find({"tokens._id": req.params.tokenId})
//         console.log(response);
//         const tokenInfo = response[0].tokens.filter(token => token._id == req.params.tokenId)[0];
//         console.log(tokenInfo);
//         res.json(tokenInfo)
//     }catch(err){
//         res.json({ message: err })
//     }
// })


// **********************************************************************



module.exports = router;