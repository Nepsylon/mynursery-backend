import { Exclude } from 'class-transformer';
import { BaseEntity, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';

@Entity()
export class MyNurseryBaseEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    // @DeleteDateColumn()
    // deletedAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @CreateDateColumn()
    createdAt: Date;
    @Exclude()
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
}
