import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, unique: true, length: 100 })
  title: string;

  @Column({ type: "varchar", nullable: true, unique: false, length: 100 })
  categoryTitle: string;

  @ManyToOne(() => Topic, (topic) => topic.subtopic, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  topic: Topic;

  @OneToMany(() => Topic, (topic) => topic.topic)
  subtopic: Topic[];

  @OneToMany(() => Quiz, (quiz) => quiz.topic)
  quizs: Quiz[];
}