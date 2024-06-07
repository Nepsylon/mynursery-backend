import { BaseEntity, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class MyNurseryBaseEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @DeleteDateColumn()
    deletedAd: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @CreateDateColumn()
    createdAt: Date;
}
