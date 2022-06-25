import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@app/user/decorators/user.decorator';
import { ProfileResponseInterface } from '@app/profile/types/profile.response';
import { ProfileService } from '@app/profile/profile.service';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(
      username,
      currentUserId,
    );

    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @Param('username') username: string,
    @User('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(username, userId);

    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @Param('username') username: string,
    @User('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unfollowProfile(username, userId);

    return this.profileService.buildProfileResponse(profile);
  }
}
