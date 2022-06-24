import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileType } from '@app/profile/types/profile.type';
import { ProfileResponseInterface } from '@app/profile/types/profile.response';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfile(
    username: string,
    currentUserId: number,
  ): Promise<ProfileType> {
    const profile = await this.userRepository.findOne({
      username,
    });

    if (!profile) {
      throw new HttpException(
        'Profile with this username not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return { ...profile, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;

    return { profile };
  }
}
