// MongoDB initialization script
// This script creates the database and user for the gym-control application

db = db.getSiblingDB('gymcontrol');

// Create a user for the gymcontrol database
db.createUser({
  user: 'mongo-user',
  pwd: '123456',
  roles: [
    {
      role: 'readWrite',
      db: 'gymcontrol'
    }
  ]
});

// Create initial collections if needed
db.createCollection('members');
db.createCollection('memberships');
db.createCollection('payments');

print('MongoDB initialized successfully for gymcontrol database');
