import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { RegisterUserDto } from '../dto/register-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('register_user')
  async registerUser(@Payload() registerUserDto: RegisterUserDto) {
    try {
      const result = await this.userService.registerUser(registerUserDto);
      return { success: true, message: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @MessagePattern('validate_user')
  async validateUser(@Payload() data: { email: string; password: string }) {
    try {
      const user = await this.userService.validateUser(data.email, data.password);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @MessagePattern('get_user_profile')
  async getUserProfile(@Payload() userId: number) {
    try {
      const profile = await this.userService.getUserProfile(userId);
      if (!profile) {
        return { success: false, message: 'User not found' };
      }
      return { success: true, profile };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}