import { Injectable } from '@nestjs/common';
import { 
  Model, 
  FindOptions, 
  UpdateOptions, 
  DestroyOptions, 
  ModelStatic, 
  QueryTypes, 
  WhereOptions 
} from 'sequelize';
import { 
  IBaseRepository, 
  ModelAttributes, 
  ModelCreationAttributes, 
  AtLeastOneAttribute 
} from './interface/IBase';
import { MakeNullishOptional } from 'sequelize/types/utils';

@Injectable()
export class BaseRepository<T extends Model> implements IBaseRepository<T> {
  protected readonly model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async create(body: ModelCreationAttributes<T>): Promise<ModelAttributes<T>> {
    return await this.model.create(body as MakeNullishOptional<ModelCreationAttributes<T>>);
  }

  async findAll(query?: Partial<ModelAttributes<T>>): Promise<ModelAttributes<T>[]> {
    const data =  await this.model.findAll({
      where: query as unknown as WhereOptions<T>,
    });
    return data.map(e=>e.toJSON())
  }

  async findOne(query: AtLeastOneAttribute<T>): Promise<ModelAttributes<T>> {
    const data =  await this.model.findOne({
      where: query as unknown as WhereOptions<T>,
    })
    return data.toJSON()
  }

  async update(
    filter: AtLeastOneAttribute<T>, 
    body: AtLeastOneAttribute<T>, 
  ): Promise<[affectedCount: number]> {
    return await this.model.update(body, {
      where: filter as unknown as WhereOptions<T>,
    });
  }

  async delete(
    filter: AtLeastOneAttribute<T>, 
    options?: DestroyOptions<T>
  ): Promise<number> {
    return await this.model.destroy({
      where: filter as unknown as WhereOptions<T>,
      ...options,
    });
  }

  async rawQuery(query: string): Promise<ModelAttributes<T>[]| any> {
    return await this.model.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
  }
}
