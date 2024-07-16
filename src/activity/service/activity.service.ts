import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Activity } from '../entities/activity.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Child } from 'src/child/entities/child.entity';
import { createActivityDto } from '../interface/create-activity-dto';

@Injectable()
export class ActivityService extends MyNurseryBaseService<Activity> {
    constructor(
        @InjectRepository(Activity) private repo: Repository<Activity>,
        @InjectRepository(Child) private childRepo: Repository<Child>,
    ) {
        super(repo);
    }

    async eligibleCreateFormat(dto: createActivityDto): Promise<boolean> {
        this.errors = [];
        return this.hasErrors();
    }

    async setChildToActivity(activityId: number, NewchildId: number): Promise<Activity | HttpException> {
        this.errors = [];

        const child = await this.childRepo.findOne({ where: { id: NewchildId }, relations: ['activity'] });

        const activity = await this.repo.findOneBy({ id: activityId });

        // Si l'activity n'existe pas
        if (!activity) {
            this.generateError(`Le activity n'existe pas.`, 'invalid activity id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si l'enfant est déjà attribué
        if (activity.children != null && activity.children.some((elem) => elem.id === NewchildId)) {
            this.generateError(`L'enfant est déjà attribué`, `Can't reassign same child`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si l'enfant n'existe pas
        if (!child) {
            this.generateError(`L'enfant n'existe pas`, 'invalid child id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
        activity.children.push(child);
        await this.repo.save(activity);
        return await this.repo.findOneBy({ id: activityId });
    }

    async createActivityWithChildren(createActiviteDto: createActivityDto): Promise<Activity> {
        const { title, children, startDate, endDate, categorie } = createActiviteDto;

        const children_data = await this.childRepo.find({ where: { id: In(children) } });
        if (children.length !== children.length) {
            this.generateError(`Un ou plusieurs enfants n'ont pas été trouvé`, 'invalid child id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        const activity = new Activity();
        activity.title = title;
        activity.startDate = startDate;
        activity.endDate = endDate;
        activity.categorie = categorie;
        activity.children = children_data;

        return await this.repo.save(activity);
    }
}
