import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { IBaseController, ModelAttributes, ModelCreationAttributes, AtLeastOneAttribute, EntityAttributes } from './interface/IBase';
import { Model } from 'sequelize-typescript';
import { BaseService } from './service.base';

@Controller()
export class BaseController<T extends Model<any, any>> implements IBaseController<T> {
  constructor(private readonly service: BaseService<T>) {}
  @Post()
  async create(@Body() data: ModelCreationAttributes<T>): Promise<ModelAttributes<T>> {
    return this.service.create(data);
  }
  @Get('/')
  async findAll(
    @Query() query?: EntityAttributes<T>,
    @Req() req?: any, 
): Promise<ModelAttributes<T>[]> {
    return this.service.findAll(query);
  }
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ModelAttributes<T>> {
    return this.service.findOne({ id } as unknown as AtLeastOneAttribute<T>);
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: AtLeastOneAttribute<T>): Promise<string> {
    return await this.service.update({id} as unknown as AtLeastOneAttribute<T>, data);
  }
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    await this.service.delete({ id } as unknown as AtLeastOneAttribute<T>);
    return 'delete successful';
  }
}
