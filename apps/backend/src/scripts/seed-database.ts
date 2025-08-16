import bcrypt from 'bcryptjs';
import { envs } from '../config/envs.js';
import { MongoDatabase } from '../infrastructure/database/mongo/connection.js';
import { MemberModel } from '../infrastructure/database/mongo/models/member.model.js';
import { UserModel } from '../infrastructure/database/mongo/models/user.model.js';
import { TrainerModel } from '../infrastructure/database/mongo/models/trainer.model.js';
import { SystemConfigModel } from '../infrastructure/database/mongo/models/system-config.model.js';
import { PaymentModel } from '../infrastructure/database/mongo/models/payment.model.js';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    await MongoDatabase.connect({ mongoUrl: envs.MONGO_URL });
    
    console.log('🧹 Limpiando colecciones existentes...');
    await Promise.all([
      MemberModel.deleteMany({}),
      UserModel.deleteMany({}),
      TrainerModel.deleteMany({}),
      SystemConfigModel.deleteMany({}),
      PaymentModel.deleteMany({})
    ]);

    console.log('⚙️ Creando configuración del sistema...');
    const systemConfig = await SystemConfigModel.create({
      basePrice: 15000,
      gracePeriodDays: 30,
      suspensionMonths: 3,
      updatedAt: new Date(),
      updatedBy: 'admin'
    });

    console.log('🏋️ Creando trainers...');
    const trainers = await TrainerModel.insertMany([
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@gymcontrol.com',
        phone: '+54 9 11 1234-5678',
        hireDate: new Date('2023-01-15'),
        isActive: true
      },
      {
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@gymcontrol.com',
        phone: '+54 9 11 8765-4321',
        hireDate: new Date('2023-03-20'),
        isActive: true
      }
    ]);

    console.log('👥 Creando members...');
    const currentDate = new Date();
    const members = await MemberModel.insertMany([
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        weight: 75,
        age: 28,
        joinDate: new Date('2024-01-15'),
        membershipStatus: 'active',
        paidUntil: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 días desde hoy
      },
      {
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@email.com',
        weight: 60,
        age: 25,
        joinDate: new Date('2024-02-01'),
        membershipStatus: 'active',
        paidUntil: new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 días desde hoy
      },
      {
        firstName: 'Luis',
        lastName: 'Martínez',
        email: 'luis.martinez@email.com',
        weight: 80,
        age: 32,
        joinDate: new Date('2023-12-10'),
        membershipStatus: 'inactive',
        paidUntil: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 días atrás
      },
      {
        firstName: 'Carmen',
        lastName: 'López',
        email: 'carmen.lopez@email.com',
        weight: 55,
        age: 29,
        joinDate: new Date('2024-01-20'),
        membershipStatus: 'active',
        paidUntil: new Date(currentDate.getTime() + 45 * 24 * 60 * 60 * 1000) // 45 días desde hoy
      },
      {
        firstName: 'Roberto',
        lastName: 'Sánchez',
        email: 'roberto.sanchez@email.com',
        weight: 85,
        age: 35,
        joinDate: new Date('2023-11-05'),
        membershipStatus: 'suspended',
        paidUntil: new Date(currentDate.getTime() - 120 * 24 * 60 * 60 * 1000) // 120 días atrás
      },
      {
        firstName: 'Patricia',
        lastName: 'Fernández',
        email: 'patricia.fernandez@email.com',
        weight: 65,
        age: 27,
        joinDate: new Date('2024-02-15'),
        membershipStatus: 'active',
        paidUntil: new Date(currentDate.getTime() + 20 * 24 * 60 * 60 * 1000) // 20 días desde hoy
      }
    ]);

    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('123456', saltRounds);

    console.log('🔐 Creando usuarios...');
    const users = [];

    users.push({
      userName: 'admin',
      password: defaultPassword,
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    });

    for (let i = 0; i < trainers.length; i++) {
      users.push({
        userName: `trainer${i + 1}`,
        password: defaultPassword,
        role: 'trainer',
        trainerId: trainers[i]._id.toString(),
        createdAt: new Date(),
        isActive: true
      });
    }

    for (let i = 0; i < members.length; i++) {
      users.push({
        userName: `member${i + 1}`,
        password: defaultPassword,
        role: 'member',
        memberId: members[i]._id.toString(),
        createdAt: new Date(),
        isActive: true
      });
    }

    await UserModel.insertMany(users);

    console.log('💳 Creando pagos...');
    const payments = [];

    for (let i = 0; i < 4; i++) {
      payments.push({
        memberId: members[i]._id.toString(),
        amount: 15000,
        paymentMethod: i % 2 === 0 ? 'cash' : 'mercadopago',
        paymentDate: new Date(currentDate.getTime() - (30 - (i * 5)) * 24 * 60 * 60 * 1000),
        monthsCovered: 1,
        isProportional: false,
        hasPromotion: false
      });
    }

    payments.push({
      memberId: members[2]._id.toString(), // Luis Martínez (inactive)
      amount: 15000,
      paymentMethod: 'transfer',
      paymentDate: new Date(currentDate.getTime() - 35 * 24 * 60 * 60 * 1000),
      monthsCovered: 1,
      isProportional: false,
      hasPromotion: false
    });

    payments.push({
      memberId: members[4]._id.toString(), // Roberto Sánchez (suspended)
      amount: 15000,
      paymentMethod: 'cash',
      paymentDate: new Date(currentDate.getTime() - 150 * 24 * 60 * 60 * 1000),
      monthsCovered: 1,
      isProportional: false,
      hasPromotion: false
    });

    await PaymentModel.insertMany(payments);

    console.log('✅ Seed completado exitosamente!');
    console.log('\n📊 Datos creados:');
    console.log(`- ${members.length} members`);
    console.log(`- ${trainers.length} trainers`);
    console.log(`- ${users.length} usuarios`);
    console.log(`- 1 configuración del sistema`);
    console.log(`- ${payments.length} pagos`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('Admin: usuario="admin", contraseña="123456"');
    console.log('Trainers: usuario="trainer1/trainer2", contraseña="123456"');
    console.log('Members: usuario="member1/member2/etc", contraseña="123456"');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await MongoDatabase.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Execute seed
seedDatabase();