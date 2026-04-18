import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Character from './Character';

export interface CommentAttributes {
  id: number;
  characterId: number;
  author: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentCreationAttributes
  extends Optional<CommentAttributes, 'id'> {}

class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public characterId!: number;
  public author!: string;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
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
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comments',
    underscored: true,
    timestamps: true,
  }
);

Character.hasMany(Comment, { foreignKey: 'character_id', as: 'comments' });
Comment.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });

export default Comment;
