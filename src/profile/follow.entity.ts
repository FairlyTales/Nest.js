import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'follows',
})
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // who is following
  @Column()
  followerId: number;

  // who is being followed
  @Column()
  followingId: number;
}
