import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column()
  position: number;

  @Column()
  equipmentLevel: string;

  @Column('float')
  points: number;

  @Column()
  weightClassID: string;

  @Column()
  discipline: string;

  @Column()
  division: string;

  @Column()
  sex: string;
}
