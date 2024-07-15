import { categorie } from 'src/shared/enums/categorie.enum';
import { Child } from 'src/child/entities/child.entity';

export interface createActivityDto {
    title: string;
    startDate: Date;
    endDate?: Date;
    categorie: categorie;
    children: Child[];
}
