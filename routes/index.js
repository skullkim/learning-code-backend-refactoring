const express = require('express');
const AWS = require('aws-sdk');

const {jsonResponse} = require('../lib/jsonResponse');
const {AwsConfig} = require('../lib/awsConfig');

const router = express.Router();

/**
*   tags:
*       name: mainPageImage
*       description: API to display image
*/
/**
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
            img_url: '/main-page-image/Learning-Code'
        },
        {
            img_url: '/main-page-image/main2'
        },
        {
            img_url: '/main-page-image/programming-lan'
        }
    ];
    res.setHeader('Content-Type', 'application/vnd.api+json');
    res.status(200);
    res.json(jsonResponse(req, resData));
});

router.get('/main-page-image/:image', async(req, res, next) => {
    const s3 = new AWS.S3();
    s3.getObject({
        Bucket: `${process.env.AWS_S3_BUCKET}`,
        Key: `upload/${req.params.image}.png`,
    }, (err, data) => {
        if(err) {
            next(err);
        }
        else {
            res.setHeader('Content-Type', 'image/png');
            res.write(data.Body, 'binary');
            res.end(null, 'binary');
        }
    });
})

router.get('/')

module.exports = router;