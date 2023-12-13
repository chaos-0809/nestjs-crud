import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectRepository(User)
    private userDB: Repository<User>,
  ) {}

  async getAllUser(): Promise<User[]> {
    return await this.userDB.find();
  }

  async getOneUser(id: number): Promise<User> {
    const user = await this.userDB.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Can't find user with id ${id}`);
    }
    return user;
  }

  async createUser(userDto: UserDto): Promise<void> {
    const { username, password } = userDto;

    const salt = await bcrypt.genSalt();
    const hashed_PW = await bcrypt.hash(password, salt);

    const user = this.userDB.create({ username, password: hashed_PW });

    try {
      await this.userDB.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userDB.delete({ id });

    if (user.affected === 0) {
      throw new NotFoundException(`can't find user with id ${id}`);
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean }> {
    const result = await this.userDB.update({ id }, updateUserDto);

    if (result.affected) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
      };
    }
  }
}
