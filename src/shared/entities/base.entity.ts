import { BaseEntity, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class MyNurseryBaseEntity extends BaseEntity {
    @PrimaryColumn()
    id: number;
    @DeleteDateColumn()
    deletedAd: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @CreateDateColumn()
    createdAt: Date;
}
