import { Model, InferAttributes, InferCreationAttributes, FindOptions, DestroyOptions } from 'sequelize';
import { MakeNullishOptional } from 'sequelize/types/utils';

export type ModelAttributes<T extends Model<any, any>> = InferAttributes<T>;
export type ModelCreationAttributes<T extends Model<any, any>> = MakeNullishOptional<InferCreationAttributes<T>>;
export type ModelUpdateAttributes<T extends Model<any, any>> = Partial<InferAttributes<T>>;
export type EntityAttributes<T extends Model<any, any>> = Partial<InferAttributes<T>>
type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<T>;
}[keyof T];
export type AtLeastOneAttribute<T extends Model<any,any>> = AtLeastOne<InferAttributes<T>>;

// }
export interface IBase<T extends Model<any, any>>  {
  create(body: ModelCreationAttributes<T>): Promise<ModelAttributes<T>>;
  findAll(query?: EntityAttributes<T>): Promise<ModelAttributes<T>[]>;
  findById(id: string): Promise<ModelAttributes<T>>;
  update(id: string, body: AtLeastOneAttribute<T>):  Promise<string>;
  delete(id: string, options?: DestroyOptions<T>): Promise<string>;
}

export interface IBaseService<T extends Model<any, any>>  {
  create(body: ModelCreationAttributes<T>): Promise<ModelAttributes<T>>;
  findAll(query?: EntityAttributes<T>): Promise<ModelAttributes<T>[]>;
  findOne(query: AtLeastOneAttribute<T>): Promise<ModelAttributes<T>| null>;
  update(filter: AtLeastOneAttribute<T>, body: AtLeastOneAttribute<T>):  Promise<string>;
  delete(filter: AtLeastOneAttribute<T>, options?: DestroyOptions<T>): Promise<string>;
  rawQuery(query: string): Promise<ModelAttributes<T>[]>;
}

export interface IBaseRepository<T extends Model<any, any>>  {
  create(body: ModelCreationAttributes<T>): Promise<ModelAttributes<T>>;
  findAll(query?: EntityAttributes<T>): Promise<ModelAttributes<T>[]>;
  findOne(query: AtLeastOneAttribute<T>): Promise<ModelAttributes<T>| null>;
  update(filter: AtLeastOneAttribute<T>, body: AtLeastOneAttribute<T>):  Promise<[affectedCount: number]>;
  delete(filter: AtLeastOneAttribute<T>, options?: DestroyOptions<T>): Promise<number>;
  rawQuery(query: string): Promise<ModelAttributes<T>[]>;
}

export interface IBaseController<Y extends Model<any, any>> {
  create(body: ModelCreationAttributes<Y>): Promise<ModelAttributes<Y>>;
  findById(id: string): Promise<ModelAttributes<Y>| null>;
  update(id: string, body: AtLeastOneAttribute<Y>):  Promise<string>;
  delete(id: string, options?: DestroyOptions<Y>): Promise<string>;
  findAll(query?: EntityAttributes<Y>): Promise<ModelAttributes<Y>[] | { 
    data: Y[]; 
    totalRecords: number; 
    totalPages: number; 
    currentPage: any; 
  }>;
}
