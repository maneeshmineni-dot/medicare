const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  // If Supabase is already configured and no explicit remote MONGODB_URI is set, skip Mongo
  if (process.env.SUPABASE_URL && !mongoURI) {
    console.log('[Database] Supabase configured as primary database. MongoDB connection skipped.');
    isConnected = false;
    return null;
  }

  const uriToUse = mongoURI || 'mongodb://localhost:27017/pharmavision';

  // In production without explicit MONGODB_URI, skip localhost attempt
  if (process.env.NODE_ENV === 'production' && !mongoURI) {
    console.log('[Database] Running in production with Supabase/In-Memory fallback store.');
    isConnected = false;
    return null;
  }

  try {
    const conn = await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`[Database] Notice: Local MongoDB not running (${error.message}). Using Supabase/In-Memory store.`);
    isConnected = false;
    return null;
  }
};

const getIsConnected = () => isConnected;

module.exports = {
  connectDB,
  getIsConnected
};
