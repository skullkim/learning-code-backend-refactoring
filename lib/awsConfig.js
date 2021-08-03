const AWS = require('aws-sdk');

require('dotenv').config();

exports.AwsConfig = AWS.config.update({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
    region: `${process.env.AWS_region}`
})