const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            commenter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            commenter: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            posting_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            comment: {
                type: Sequelize.STRING(310),
                allowNULL: false,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db){
        db.Comment.belongsTo(db.User, {foreignKey: 'commenter_id', targetKey: 'id'});
    }
}