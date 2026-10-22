import { ApiProperty } from '@nestjs/swagger';
export class CommentDto {
  @ApiProperty({
    description: 'A property saving the comment content',
    example: 'This Run is So Good!',
  })
  comment: string;
}
