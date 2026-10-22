import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({
    description:
      'A String with email format [email_name]@[sub_domain].[domain]',
    example: 'william.liman@gmail.com',
  })
  email: string;
  @ApiProperty({
    description:
      'A String used for Authentication Purpose, Must be >= 8 Character, Must Contain At Least 1 Upper Case, 1 Lower Case, 1 Number, and 1 Symbol',
    example: 'Pisang1234*',
  })
  password: string;
}
