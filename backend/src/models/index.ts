import sequelize from "../config/database";
import User from "./user.model";
import Todo from "./todo.model";

// Define associations between models
const initAssociations = () => {
  // User has many Todos
  User.hasMany(Todo, {
    foreignKey: "userId",
    as: "todos",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Todo belongs to User
  Todo.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
};

// Initialize all associations
initAssociations();

// Export sequelize instance and all models
export { sequelize, User, Todo };

// Export a default object containing all models for convenience
export default {
  sequelize,
  User,
  Todo,
};
