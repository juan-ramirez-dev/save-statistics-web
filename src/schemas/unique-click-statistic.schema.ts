import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UniqueClickStatisticDocument = UniqueClickStatistic & Document;

@Schema({ 
  collection: 'unique_click_statistics',
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
export class UniqueClickStatistic {
  @ApiProperty({ description: 'Description of the click (button, link, etc.)' })
  @Prop({ required: true })
  text: string;

  @ApiProperty({ description: 'User ID who performed the clicks' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @ApiProperty({ description: 'Number of times this text has been clicked' })
  @Prop({ required: true, default: 1 })
  count: number;
}

export const UniqueClickStatisticSchema = SchemaFactory.createForClass(UniqueClickStatistic); 