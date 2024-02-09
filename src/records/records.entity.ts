import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  recordLevel: string;

  @Column()
  equipmentLevel: string;

  @Column('float')
  weight: number;

  @Column()
  weightClassID: string;

  @Column()
  discipline: string;

  @Column()
  division: string;

  @Column()
  sex: string;

  @Column({ nullable: true })
  usState: string;
}
