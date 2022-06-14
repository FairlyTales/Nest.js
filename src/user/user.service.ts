import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    const userByUserName = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail)
      throw new HttpException(
        'User with this email is already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    if (userByUserName)
      throw new HttpException(
        'User with this name is already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    const { password: _, ...userData } = user;

    return {
      user: {
        ...userData,
        token: this.generateJwt(user),
      },
    };
  }
}
