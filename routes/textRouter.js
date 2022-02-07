const express = require('express');
const Texts = require('../models/text');
const Fuse = require('fuse.js');

const textRouter = express.Router();

textRouter.route('/') // /text endpoint
.get((req, res, next) => {
    Texts.find({})
        .then((texts) => {
            res.statusCode = 200;
            /*res.setHeader('Content-Type', 'application/json');
            res.json(texts); */
            res.setHeader('Content-Type', 'text/html');
            for (let i = 0; i < texts.length; i++) {
                res.write(`<section>
                        <h2>-------------Text ${i + 1}-------------------</h2>
                        <div>
                            <h3>English Version</h3>
                            <p>${texts[i].englishVersion}</p>
                        </div>
                        <div>
                            <h3>French Version</h3>
                            <p>${texts[i].frenchVersion}</p>
                        </div>
                        <div>
                            <h3>Arabic Version</h3>
                            <p>${texts[i].arabicVersion}</p>
                        </div>
                    </section>`)
            }
            res.end();
        })
        .catch((err) => next(err));
})
.post((req, res, next) => {
    Texts.create({
        frenchVersion: req.body.frenchVersion,
        englishVersion: req.body.englishVersion,
        arabicVersion: req.body.arabicVersion,
        state: "draft"
    })
        .then((text) => {
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.json(text);
        })
        .catch((err) => next(err));
})
//********************************************************************************************* */
textRouter.route('/:textId')
.put((req, res, next) => {
    Texts.findByIdAndUpdate(req.params.textId, { $set: req.body }, { new: true })
        .then((text) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(text);
        })
        .catch((err) => next(err));

})
//************************************************************************************************/

textRouter.route('/:textId/count')
.get((req, res, next) => {
    Texts.findById(req.params.textId)
        .then((text) => {
            if (text == null) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Text not found');
            } else {
                let count = {
                    countFrench: text.frenchVersion.match(/\w+/g).length,
                    countEnglish: text.englishVersion.match(/\w+/g).length,
                    countArabic: text.arabicVersion.match(/[\u0600-\u06FF]+/g).length
                }
                res.setHeader('Content-Type', 'application/json');
                res.json(count);
            }
        })
        .catch((err) => next(err));
});
//******************************************************************************************************** */

textRouter.route('/:textId/state') //modify text state according to the scheme
.put((req, res, next)=>{
    Texts.findById(req.params.textId)
    .then((text)=>{
        if(text != null){
            res.setHeader('Content-Type', 'application/json');
            switch(text.state){
                case 'draft':
                    req.body.state === 'submitted' ? text.state = 'submitted' : res.statusCode = 403, res.end(); 
                    break;

                case 'submitted':
                    req.body.state === 'approved' || req.body.state==='rejected' ? text.state = req.body.state : res.statusCode = 403, res.end(); 
                    break;
                
                case 'rejected':
                    req.body.state === 'submitted' ? text.state = 'submitted' : res.statusCode = 403, res.end(); 
                    break;
                
                case 'approved':
                    if(req.body.state != 'approved'){
                        res.statusCode = 403; 
                        res.end();
                    }
                    break;
            }
            text.save()
            .then((text)=>{
                res.statusCode = 200;
                res.json(text);
            })
            .catch((err)=>next(err));
            
        }else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Text not found');
        }
    })
    .catch((err)=>next(err));
})

//********************************************************************************************************* */

textRouter.route('/:textId/count/:language')
.get((req, res, next) => {
    Texts.findById(req.params.textId)
        .then((text) => {
            if (text == null) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Text not found');
            } else {
                let count = {}
                switch (req.params.language) {
                    case 'fr':
                        count = {
                            count: text.frenchVersion.match(/\w+/g).length
                        }
                        break;
                    case 'en':
                        count = {
                            count: text.englishVersion.match(/\w+/g).length
                        }
                        break;
                    case 'ar':
                        count = {
                            count: text.arabicVersion.match(/[\u0600-\u06FF]+/g).length
                        }
                        break;
                }
                res.setHeader('Content-Type', 'application/json');
                res.json(count);
            }
        })
        .catch((err) => next(err));
})
//*************************************************************************************************************** */

textRouter.route('/mostOccurrent')
.get((req, res, next) => {
    Texts.find({})
    .then((texts)=>{
        if(texts.length == 0){
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No text in the database');
        }else{
            let allWordsTabFr = [];
            let allWordsTabEn = [];
            let allWordsTabAr = [];
            for(let text of texts){
                let contentFr = text.frenchVersion.match(/\w+/g);
                let contentEn = text.englishVersion.match(/\w+/g);
                let contentAr = text.arabicVersion.match(/[\u0600-\u06FF]+/g);

                for(let word of contentFr){
                    allWordsTabFr.push(word);
                }
                for(let word of contentEn){
                    allWordsTabEn.push(word);
                }
                for(let word of contentAr){
                    allWordsTabAr.push(word);
                }
            }

            let uniqueWordsTabFr = [... new Set(allWordsTabFr)];
            let uniqueWordsTabEn = [... new Set(allWordsTabEn)];
            let uniqueWordsTabAr = [... new Set(allWordsTabAr)];


            let maxOccur = {
                fr : {
                    word: '',
                    num: 0
                },
                en : {
                    word: '',
                    num: 0
                },
                ar : {
                    word: '',
                    num: 0
                }   
            };

            for(let word of uniqueWordsTabFr){
                let num = allWordsTabFr.filter((elm)=>elm===word).length;
                if(num > maxOccur.fr.num){
                    maxOccur.fr.word = word;
                    maxOccur.fr.num = num;
                }
            }

            for(let word of uniqueWordsTabEn){
                let num = allWordsTabEn.filter((elm)=>elm===word).length;
                if(num > maxOccur.en.num){
                    maxOccur.en.word = word;
                    maxOccur.en.num = num;
                }
            }

            for(let word of uniqueWordsTabAr){
                let num = allWordsTabAr.filter((elm)=>elm===word).length;
                if(num > maxOccur.ar.num){
                    maxOccur.ar.word = word;
                    maxOccur.ar.num = num;
                }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(maxOccur); 
        }
    })
    .catch((err)=>next(err));
})

//************************************************************************************ */
textRouter.route('/search') //returns all the text object that suits the search request
.post((req, res, next)=>{
    Texts.find({})
    .then((texts)=>{
        if(texts.length == 0){

        }else{
            const fuse = new Fuse(texts, {
                keys : ['frenchVersion', 'englishVersion']
            });
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(fuse.search(req.query.q)); 
            res.end();
        }
    })
    .catch((err)=>next(err));
    

})

module.exports = textRouter;