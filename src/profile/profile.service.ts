import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileType } from '@app/profile/types/profile.type';
import { ProfileResponseInterface } from '@app/profile/types/profile.response';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
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

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: profile.id,
    });

    return { ...profile, following: Boolean(follow) };
  }

  async followProfile(username: string, userId: number): Promise<ProfileType> {
    const profile = await this.getProfile(username, userId);

    if (userId === profile.id) {
      throw new HttpException(
        'You can not follow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: profile.id,
    });

    if (follow) {
      throw new HttpException(
        'You already follow this profile',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newFollow = new FollowEntity();

    newFollow.followerId = userId;
    newFollow.followingId = profile.id;

    await this.followRepository.save(newFollow);

    return { ...profile, following: true };
  }

  async unfollowProfile(
    username: string,
    userId: number,
  ): Promise<ProfileType> {
    const profile = await this.getProfile(username, userId);

    if (userId === profile.id) {
      throw new HttpException(
        'You can not unfollow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: profile.id,
    });

    if (!follow) {
      throw new HttpException(
        "You already don't follow this profile",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: userId,
      followingId: profile.id,
    });

    return { ...profile, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;

    return { profile };
  }
}
