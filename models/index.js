const Sequelize = require('sequelize');
const User = require('./users');
const Comment = require('./comments');
const Posting = require('./postings');
const PostingImage = require('./postingImage');
const Tag = require('./Tag');
const Token = require('./Token');

const env = process.env.NODE_DEV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
    config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.User = User;
db.Comment = Comment;
db.Posting = Posting;
db.PostingImage =  PostingImage;
db.Tag = Tag;
db.Token = Token;

User.init(sequelize);
Comment.init(sequelize);
Posting.init(sequelize);
PostingImage.init(sequelize);
Tag.init(sequelize);
Token.init(sequelize);

User.associate(db);
Comment.associate(db);
Posting.associate(db);

module.exports = db;