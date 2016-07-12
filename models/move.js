module.exports = function (sequelize, DataTypes) {
    return sequelize.define('move', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },

        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            },
            defaultValue: 'Cross-functional'
        }
    });
}