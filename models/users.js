const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            name: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            login_as: {
                type: Sequelize.ENUM('local', 'kakao', 'google'),
            },
            api_id: {
                type: Sequelize.INTEGER,
            },
            profile_img_key: {
                type: Sequelize.STRING(200),
                defaultValue: null,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }
    static associate(db) {
        db.User.hasMany(db.Comment, {foreignKey: 'commenter_id', sourceKey: 'id'});
        db.User.hasMany(db.Posting, {foreignKey: 'author', sourceKey: 'id'});
    }
}
