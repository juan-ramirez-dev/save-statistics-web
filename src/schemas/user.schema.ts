import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
})
export class User {
  @ApiProperty({ description: 'Nombre del usuario' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', uniqueItems: true })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiHideProperty()
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'Estado del usuario', default: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Rol del usuario', enum: ['admin', 'user'], default: 'user' })
  @Prop({ enum: ['admin', 'user'], default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 