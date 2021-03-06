import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { AppService } from '@app/app.service';

@Injectable()
export class UserService {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    const userByUserName = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail)
      this.appService.throwHttpException(
        'email',
        'User with this email is already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    if (userByUserName)
      this.appService.throwHttpException(
        'username',
        'User with this name is already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });

    if (!userByEmail) {
      this.appService.throwHttpException(
        'email',
        'User with this email not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await compare(
      loginUserDto.password,
      userByEmail.password,
    );

    if (!isPasswordValid) {
      this.appService.throwHttpException(
        'password',
        'Incorrect password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    delete userByEmail.password;

    return userByEmail;
  }

  async getUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    const updateResult = await this.userRepository
      .createQueryBuilder()
      .update({
        ...user,
        ...updateUserDto,
      })
      .where({
        id: user.id,
      })
      .returning('*')
      .execute();

    return updateResult.raw[0];
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
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
