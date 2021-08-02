const express = require('express');

const {jsonResponse} = require('../lib/jsonResponse');

const router = express.Router();

/**
* @swagger
*   tags:
*       name: mainPageImage
*       description: API to display image
*/
/**
 * @swagger
 * paths:
 *  /main-page-images:
 *      get:
 *          summary: response main page images url
 *          tags: [mainPageImage]
 *          responses:
 *              "200":
 *                  description: The list of image urls
 *                  content:
 *                      application/vnd.api+json:
 *                          schema:
 *                              $ref: '#/components/schema/mainImages'
 */


router.get('/main-page-images', (req, res, next) => {
    const resData = [
        {
            img_url: process.env.MAIN_LOGO_KEY
        },
        {
            img_url: process.env.MAIN_IMG2
        },
        {
            img_url: process.env.MAIN_IMG3
        }
    ];
    res.setHeader('Content-Type', 'application/vnd.api+json');
    res.status(200);
    res.json(jsonResponse(req, resData));
});



module.exports = router;