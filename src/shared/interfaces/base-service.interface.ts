import { HttpException } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
//import { ErrorResponse } from '../models/error-response';

export interface BaseService<T> {
    findAll(): Promise<T[] | HttpException>;
    findOne(id: string): Promise<T | HttpException>;
    create(dto: T): Promise<T | HttpException>;
    update(id: string, dto: Partial<T>): Promise<UpdateResult | HttpException>;
    delete(id: string): Promise<DeleteResult | HttpException>;
    softDelete(id: string): Promise<boolean | HttpException>;
    softDeleteMultiple(ids: number[]): Promise<boolean | HttpException>;
}
