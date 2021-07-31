const Sequelize = require('sequelize');

module.exports = class Token extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            kakao_access: {
                type: Sequelize.TEXT,
            },
            kakao_refresh: {
                type: Sequelize.TEXT,
            },
            google_access: {
                type: Sequelize.TEXT,
            },
            google_refresh: {
                type: Sequelize.TEXT,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Token',
            tableName: 'tokens',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Token.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'id'});
    }
}