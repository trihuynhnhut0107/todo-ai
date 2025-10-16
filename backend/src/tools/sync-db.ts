#!/usr/bin/env node

/**
 * Database Sync Tool
 *
 * This script syncs the database schema with the defined Sequelize models.
 * Run this manually when you need to update the database structure.
 *
 * Usage:
 *   npm run sync-db           # Sync without dropping existing tables
 *   npm run sync-db -- --force # Drop all tables and recreate (WARNING: data loss)
 */

import sequelize from "../config/database";
import "../models"; // Import models to register them

const syncDatabase = async () => {
  try {
    const args = process.argv.slice(2);
    const force = args.includes("--force") || args.includes("-f");

    if (force) {
      console.log(
        "⚠️  WARNING: Force sync enabled. All existing data will be lost!"
      );
      console.log("⏳ Waiting 3 seconds before proceeding...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("🔄 Starting database synchronization...\n");

    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    await sequelize.sync({ force, alter: !force });

    console.log(
      `\n✅ Database synced successfully ${
        force
          ? "(with force - all tables recreated)"
          : "(alter mode - safe update)"
      }`
    );

    // Get all model names
    const models = Object.keys(sequelize.models);
    console.log(`\n📊 Synced models: ${models.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error syncing database:", error);
    process.exit(1);
  }
};

syncDatabase();
