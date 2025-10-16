import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Define the attributes interface
export interface TodoAttributes {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the creation attributes (id is optional during creation)
export interface TodoCreationAttributes
  extends Optional<
    TodoAttributes,
    "id" | "completed" | "description" | "createdAt" | "updatedAt"
  > {}

// Define the Todo model class
class Todo
  extends Model<TodoAttributes, TodoCreationAttributes>
  implements TodoAttributes
{
  public id!: number;
  public title!: string;
  public description?: string;
  public completed!: boolean;
  public userId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
Todo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    tableName: "todos",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["completed"],
      },
    ],
  }
);

export default Todo;
