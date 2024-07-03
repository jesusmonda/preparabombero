import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Ip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, unique: false, length: 20 })
  ip: string;

  @ManyToOne(() => User, (user) => user.ips, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  user: User
}