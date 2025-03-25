import { Injectable } from '@nestjs/common';
import { 
  Model, 
  DestroyOptions, 
  ModelStatic, 
  QueryTypes, 
  WhereOptions, 
  Transaction, 
  Sequelize
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
  get sequelize(): Sequelize {
    return this.model.sequelize!;
  }
  async create(
    body: ModelCreationAttributes<T>, 
    transaction?: Transaction
  ): Promise<ModelAttributes<T>> {
    if (transaction) {
      return await this.model.create(body as MakeNullishOptional<ModelCreationAttributes<T>>, { transaction });
    }
    return await this.model.sequelize!.transaction(async (t) => {
      return await this.model.create(body as MakeNullishOptional<ModelCreationAttributes<T>>, { transaction: t });
    });
  }
  
  
  async findAll(query?: Partial<ModelAttributes<T>>, transaction?: Transaction): Promise<ModelAttributes<T>[]> {
    const data = await this.model.findAll({
      where: query as unknown as WhereOptions<T>,
      transaction,
    });
    return data.length ? data.map(e => e.toJSON()) : [];
  }

  async findOne(query: AtLeastOneAttribute<T>): Promise<ModelAttributes<T> | null> {
    const data = await this.model.findOne({
      where: query as unknown as WhereOptions<T>,
    });
    return data ? data.toJSON() : null;
  }

  async update(
    filter: AtLeastOneAttribute<T>, 
    body: AtLeastOneAttribute<T>, 
    transaction?: Transaction
  ): Promise<[affectedCount: number]> {
    return await this.model.sequelize!.transaction(async (t) => {
      const activeTransaction = transaction || t;
      return await this.model.update(body, {
        where: filter as unknown as WhereOptions<T>,
        transaction: activeTransaction,
      });
    });
  }
  

  async delete(filter: AtLeastOneAttribute<T>, options?: DestroyOptions<T>, transaction?: Transaction): Promise<number> {
    return await this.model.destroy({
      where: filter as unknown as WhereOptions<T>,
      transaction,
      ...options,
    });
  }

  async rawQuery(query: string, transaction?: Transaction): Promise<ModelAttributes<T>[] | any> {
    return await this.model.sequelize.query(query, {
      type: QueryTypes.SELECT,
      transaction,
    });
  }
}
