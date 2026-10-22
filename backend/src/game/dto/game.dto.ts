import { ApiProperty } from '@nestjs/swagger';
export class GameDto {
  @ApiProperty({
    description: 'A property saving the title of the game',
    example: 'Hollow Knight',
  })
  gameName: string;

  @ApiProperty({
    description: 'A property saving the description of the game',
    example:
      'Explore the vast kingdom of Hallownest and unlock new powerfull ability',
  })
  gameDescription: string;
}
