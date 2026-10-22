import { ApiProperty } from '@nestjs/swagger';
export class RunRequestDto {
  @ApiProperty({
    description: 'A property saving the game id this run belongs to',
    example: 'c502e48a-cfe7-41db-8276-961461ff3746',
  })
  gameId: string;

  @ApiProperty({
    description: 'A property saving video proof url in string format',
    example: 'https://www.youtube.com',
  })
  vodUrl: string;

  @ApiProperty({
    description: 'A property saving the run duration in seconds',
    example: 3674,
  })
  runDuration: number;
}
