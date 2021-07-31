const Sequelize = require('sequelize');

module.exports = class PostingImage extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            post_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            img_key: {
                type: Sequelize.STRING(300),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'PostingImage',
            tableName: 'posting_Images',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
}