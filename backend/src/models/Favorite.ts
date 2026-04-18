import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Character from './Character';

export interface FavoriteAttributes {
  id: number;
  characterId: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteCreationAttributes
  extends Optional<FavoriteAttributes, 'id'> {}

class Favorite
  extends Model<FavoriteAttributes, FavoriteCreationAttributes>
  implements FavoriteAttributes
{
  public id!: number;
  public characterId!: number;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'character_id',
      references: {
        model: 'characters',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'user_id',
    },
  },
  {
    sequelize,
    tableName: 'favorites',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['character_id', 'user_id'],
      },
    ],
  }
);

Character.hasMany(Favorite, { foreignKey: 'character_id', as: 'favorites' });
Favorite.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });

export default Favorite;
