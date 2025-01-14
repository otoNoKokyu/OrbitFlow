import { Injectable } from '@nestjs/common';
import { 
  AtLeastOneAttribute, 
  EntityAttributes, 
  IBaseService, 
  ModelAttributes, 
  ModelCreationAttributes 
} from './interface/IBase';
import { Model } from 'sequelize-typescript';
import { BaseRepository } from './repository.base';
import { DestroyOptions } from 'sequelize';

@Injectable()
export class BaseService<T extends Model<any, any>> implements IBaseService<T> {
  constructor(private readonly repository: BaseRepository<T>) {}

  async create(body: ModelCreationAttributes<T>): Promise<ModelAttributes<T>> {
    return await this.repository.create(body);
  }

  async findAll(query?: EntityAttributes<T>): Promise<ModelAttributes<T>[]> {
    return await this.repository.findAll(query);
  }

  async findOne(query: AtLeastOneAttribute<T>): Promise<ModelAttributes<T>> {
    const data = await this.repository.findOne(query);
    return data;
  }

  async update(
    filter: AtLeastOneAttribute<T>, 
    body: AtLeastOneAttribute<T>
  ): Promise<string>{
    const [affectedCount] = await this.repository.update(filter, body);
    if(affectedCount>0) return 'update successful'
    else return 'update unsuccessful'
  }

  async delete(
    filter: AtLeastOneAttribute<T>, 
    options?: DestroyOptions<T>
  ): Promise<string> {
    const numberOfDeletedRows =  await this.repository.delete(filter, options);
    if(numberOfDeletedRows>0) return 'deletion successful'
    else return 'deletion unsuccessful'
  }

  async rawQuery(query: string): Promise<ModelAttributes<T>[]> {
    return await this.repository.rawQuery(query);
  }
}
