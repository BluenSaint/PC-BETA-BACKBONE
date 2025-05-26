import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    example: 'Updated Post Title',
    description: 'The updated title of the post',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'This is the updated content of my post.',
    description: 'The updated content of the post',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the post is published',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
