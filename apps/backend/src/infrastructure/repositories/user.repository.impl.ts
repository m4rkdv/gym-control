import { User } from '@gymcontrol/domain/entities/User';
import { UserModel } from '../database/mongo/models/user.model';
import { UserRepository } from '@gymcontrol/domain/repositories/user-repository';


export class MongoUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const { id, ...userData } = user;
    const userDoc = new UserModel(userData);
    const saved = await userDoc.save();
    
    return {
      id: saved._id.toString(),
      userName: saved.userName,
      password: saved.password,
      role: saved.role,
      memberId: saved.memberId,
      trainerId: saved.trainerId,
      createdAt: saved.createdAt,
      isActive: saved.isActive
    };
  }

  async findByUserName(userName: string): Promise<User | null> {
    const user = await UserModel.findOne({ userName });
    if (!user) return null;

    return {
      id: user._id.toString(),
      userName: user.userName,
      password: user.password,
      role: user.role,
      memberId: user.memberId,
      trainerId: user.trainerId,
      createdAt: user.createdAt,
      isActive: user.isActive
    };
  }

  async findByTrainerId(trainerId: string): Promise<User | null> {
    const user = await UserModel.findOne({ trainerId });
    if (!user) return null;

    return {
      id: user._id.toString(),
      userName: user.userName,
      password: user.password,
      role: user.role,
      memberId: user.memberId,
      trainerId: user.trainerId,
      createdAt: user.createdAt,
      isActive: user.isActive
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return {
      id: user._id.toString(),
      userName: user.userName,
      password: user.password,
      role: user.role,
      memberId: user.memberId,
      trainerId: user.trainerId,
      createdAt: user.createdAt,
      isActive: user.isActive
    };
  }
}