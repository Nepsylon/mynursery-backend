import { HttpException } from '@nestjs/common';
import { Token } from './token.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
//import { ErrorResponse } from '../models/error-response';

export interface BaseService<T> {
    findAll(user?: Token): Promise<T[] | HttpException>;
    findOne(id: string, user?: Token): Promise<T | HttpException>;
    create(dto: T, user?: Token): Promise<T | HttpException>;
    update(id: string, dto: Partial<T>, user?: Token): Promise<UpdateResult | HttpException>;
    delete(id: string, user?: Token): Promise<DeleteResult | HttpException>;
    softDelete(id: string, user?: Token): Promise<boolean | HttpException>;
    softDeleteMultiple(dto: T, user?: Token): Promise<boolean | HttpException>;
}
