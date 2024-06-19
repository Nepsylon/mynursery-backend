import { MyNurseryBaseEntity } from "src/shared/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, OneToOne } from "typeorm";

@Entity()
export class Nursery extends MyNurseryBaseEntity {
    @Column()
    name: string;
    @Column()
    location: string;
    @Column()
    total_child: number;
    @OneToOne(() => User, (user) => user.nursery)
    owner: User;
}