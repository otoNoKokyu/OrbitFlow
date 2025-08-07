import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TransactionManagerService {
  constructor(private readonly sequelize: Sequelize) {}

  async execute<T>(operation: (transaction: any) => Promise<T>): Promise<T> {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
