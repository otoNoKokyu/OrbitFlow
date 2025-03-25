import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    if(typeof value !== 'object') return value
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false, 
      stripUnknown: true,
    });

    Object.entries(validatedValue).forEach(([k,v]) => {
      if(!v) delete validatedValue[k]
    })

    if (error) {
      throw new BadRequestException(error.details.map((d) => d.message).join(', '));
    }

    return validatedValue;
  }
}
