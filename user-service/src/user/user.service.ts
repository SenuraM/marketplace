import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Seller } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserProfile } from '../interfaces/user.interface';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<string> {
    const { email, password, firstName, lastName, role, country } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    // If seller, create seller profile
    if (role === 'seller') {
      const seller = this.sellerRepository.create({
        user: savedUser,
        country,
      });
      await this.sellerRepository.save(seller);
    }

    return 'User successfully registered';
  }

  async validateUser(email: string, password: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    let sellerInfo = {};
    if (user.role === 'seller') {
      const seller = await this.sellerRepository.findOne({ where: { user: { id: user.id } } });
      if (seller) {
        sellerInfo = {
          country: seller.country,
        };
      }
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      ...sellerInfo,
    };
  }

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const cacheKey = `user_profile_${userId}`;
    const cachedProfile = await this.cacheManager.get<UserProfile>(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    let sellerInfo = {};
    if (user.role === 'seller') {
      const seller = await this.sellerRepository.findOne({ where: { user: { id: user.id } } });
      if (seller) {
        sellerInfo = {
          country: seller.country,
        };
      }
    }

    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      ...sellerInfo,
    };

    await this.cacheManager.set(cacheKey, profile, 300); // Cache for 300 seconds
    return profile;
  }
}