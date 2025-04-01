import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ClickStatisticDocument = ClickStatistic & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class ClickStatistic {
  @ApiProperty({ description: 'Descripción del clic (botón, enlace, etc.)' })
  @Prop({ required: true })
  text: string;

  @ApiProperty({ description: 'ID del usuario que realizó el clic' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const ClickStatisticSchema = SchemaFactory.createForClass(ClickStatistic); 