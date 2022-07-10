import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { BackendValidationPipe } from '@app/pipes/BackendValidation.pipe';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: [CreateUserDto] })
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);

    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);

    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Patch('user')
  @UseGuards(AuthGuard)
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );

    return this.userService.buildUserResponse(updatedUser);
  }
}
