import { ProfileType } from '@app/profile/types/profile.type';

export interface ProfileResponseInterface {
  profile: Omit<ProfileType, 'email'>;
}
