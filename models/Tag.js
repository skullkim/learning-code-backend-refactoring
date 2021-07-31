const Sequelize = require('sequelize');

module.exports = class Tag extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
           tag: {
               type: Sequelize.STRING(45),
               allowNull: false,
           },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Tag',
            tableName: 'tags',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
}