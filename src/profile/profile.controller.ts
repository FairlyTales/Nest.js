import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { User } from '@app/user/decorators/user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @User('id') userId: number,
  ): Promise<any> {
    //TODO: add service methods
    //TODO: add profile types

    // const profile = await this.userService.getProfile(username, userId);
    // return this.userService.buildProfileResponse(profile);
  }
}
