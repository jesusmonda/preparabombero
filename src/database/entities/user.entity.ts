import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Ip } from './ip.entity';

export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, unique: true, length: 100 })
  email: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  name: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  surname: string;

  @Column({ type: "varchar", nullable: false, unique: true, length: 100 })
  password: string;

  @Column({ type: "enum", enum:UserRole, default: UserRole.USER, nullable: false, unique: false })
  role: string;

  @Column({ type: "boolean", default: false, nullable: false, unique: false })
  subscribed: string;

  @OneToMany(() => Ip, (ip) => ip.user)
  ips: Ip[]
}