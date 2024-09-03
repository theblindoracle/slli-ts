import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  lcMeetID: string;

  @Column()
  lcPlatformID: string;

  @Column()
  lcPassword: string;

  @Column()
  slControlAppToken: string;

  @Column("boolean", { default: false })
  isActive: boolean;

  @Column('int')
  sceneType: number;
}
