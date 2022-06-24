import { UserType } from '@app/user/types/user.type';

export type ProfileType = Omit<UserType, 'email' | 'password'> & {
  following: boolean;
};
