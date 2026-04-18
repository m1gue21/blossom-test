import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CharacterAttributes {
  id: number;
  externalId: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  originName: string;
  locationName: string;
  image: string;
  episode: string[];
  url: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CharacterCreationAttributes
  extends Optional<CharacterAttributes, 'id' | 'isDeleted' | 'type' | 'episode'> {}

class Character
  extends Model<CharacterAttributes, CharacterCreationAttributes>
  implements CharacterAttributes
{
  public id!: number;
  public externalId!: number;
  public name!: string;
  public status!: string;
  public species!: string;
  public type!: string;
  public gender!: string;
  public originName!: string;
  public locationName!: string;
  public image!: string;
  public episode!: string[];
  public url!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Character.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'external_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    originName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'origin_name',
    },
    locationName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'location_name',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    episode: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
    },
  },
  {
    sequelize,
    tableName: 'characters',
    underscored: true,
    timestamps: true,
  }
);

export default Character;
