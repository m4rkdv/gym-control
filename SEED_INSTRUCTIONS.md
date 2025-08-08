# 🌱 Database Seeding Instructions

This document explains how to use the seed script to populate the MongoDB database with test data.

## 📋 Prerequisites

1. **MongoDB running**: Make sure MongoDB is running on your system
2. **Environment variables**: Configure the `.env` file in `apps/backend/`

## ⚙️ Configuration

1. Copy the environment variables example file:
```bash
cd apps/backend
cp .env.example .env
```

2. Edit the `.env` file with your configurations:
```env
PORT=3100
JWT_SECRET=el_super_ultra_secreto_jwt_key_muy_seguro
MONGO_URL=mongodb://localhost:27017/gymcontrol
```

## 🚀 Run the Seed Script

From the root project directory or from `apps/backend/`:

```bash
# From the root project directory
yarn workspace @gymcontrol/backend seed

# Or from apps/backend/
cd apps/backend
yarn seed
```

## 📊 Created Data

The script will create the following test data:

### 👥 Members (6)
- **Juan Pérez** - Active, valid payment for 30 days
- **Ana García** - Active, valid payment for 15 days  
- **Luis Martínez** - Inactive, expired payment 5 days ago
- **Carmen López** - Active, valid payment for 45 days
- **Roberto Sánchez** - Suspended, payment expired 120 days ago
- **Patricia Fernández** - Active, valid payment for 20 days

### 🏋️ Trainers (2)
- **Carlos Rodríguez** - Active since January 2023
- **María González** - Active since March 2023

### 🔐 Users
- **1 Admin**: `admin` / `123456`
- **2 Trainers**: `trainer1`, `trainer2` / `123456`
- **6 Members**: `member1`, `member2`, ..., `member6` / `123456`

### ⚙️ System Configuration
- Base price: $15,000
- Grace period: 30 days
- Suspension months: 3

### 💳 Payments
- Recent payments for active members
- Expired payments for inactive/suspended members
- Different payment methods (cash, MercadoPago, transfer)

## 🧹 Cleanup

The script automatically cleans all collections before inserting new data, so it's safe to run multiple times.

## 🔍 Verification

After running the script, you can verify that the data was created correctly:

1. **Connecting to MongoDB**:
```bash
mongosh
use gymcontrol
db.members.find()
db.users.find()
```

2. **Using the API endpoints** with the provided credentials

## 🚨 Important Notes

- **Default password**: All users have the password `123456`
- **Realistic data**: Includes different membership states to test all scenarios
- **Dynamic dates**: Dates are calculated relatively to the current date
- **Automatic cleanup**: The script automatically cleans existing data before creating new ones
- **Data verification**: Use the provided API endpoints to verify the data

## 🛠️ Troubleshooting

### MongoDB connection error
```
MongoDB connection error: MongoServerError: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running and the URL in `.env` is correct.

### Environment variable error
```
EnvVarError: "MONGO_URL" is required
```
**Solution**: Verify that the `.env` file exists and contains all required variables.

### Dependency error
```
Cannot find module 'bcryptjs'
```
**Solution**: Install dependencies with `yarn install` in the `apps/backend/` directory.