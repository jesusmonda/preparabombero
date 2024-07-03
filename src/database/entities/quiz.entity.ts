import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Topic } from './topic.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, unique: true, length: 100 })
  title: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  option1: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  option2: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  option3: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  option4: string;

  @Column({ type: "varchar", nullable: false, unique: false, length: 100 })
  result: string;

  @ManyToOne(() => Topic, (topic) => topic.quizs, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  topic: Topic
}