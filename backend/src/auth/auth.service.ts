import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });
    return user;
  }
  async isEmailUnique(email: string) {
    const user = await this.getUserByEmail(email);
    if (user == null) {
      return true;
    }
    return false;
  }

  validateLength(sentence: string, min: number, max: number): boolean {
    if (sentence.length >= min && sentence.length <= max) {
      return true;
    }
    return false;
  }

  httpExceptionBuilder(error: string, status: HttpStatus): HttpException {
    return new HttpException(
      {
        error: error,
      },
      status,
      { cause: error },
    );
  }
  validatePassword(password: string) {
    const validPasswordLength = this.validateLength(password, 8, 40);
    if (!validPasswordLength) {
      throw this.httpExceptionBuilder(
        'Password Must Be Between 8-40 Characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    let hasUpper = false;
    let hasLower = false;
    let hasSymbols = false;
    let hasNumber = false;

    const symbols = '!@#$%^&*()_+=-[]{}|;:"\'<>,.?/`~';
    Array.from(password).forEach((character) => {
      if (character >= 'A' && character <= 'Z') {
        hasUpper = true;
      }
      if (character >= 'a' && character <= 'z') {
        hasLower = true;
      }
      if (character >= '0' && character <= '9') {
        hasNumber = true;
      }
      if (symbols.includes(character)) {
        hasSymbols = true;
      }
    });

    if (!hasUpper) {
      throw this.httpExceptionBuilder(
        'Password Contains At least 1 Uppercase Letter',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!hasLower) {
      throw this.httpExceptionBuilder(
        'Password Contains At least 1 Lowercase Letter',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!hasSymbols) {
      throw this.httpExceptionBuilder(
        'Password Contains At least 1 Symbol',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!hasNumber) {
      throw this.httpExceptionBuilder(
        'Password Contains At least 1 Number',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateEmail(email: string) {
    if (
      email.indexOf('@') !== email.lastIndexOf('@') ||
      email.indexOf('@') == -1
    ) {
      throw this.httpExceptionBuilder(
        'Email Must Contains Exactly One @ Symbol!',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (email.indexOf('.') == -1) {
      throw this.httpExceptionBuilder(
        'Email Must Have At Least One . Symbols!',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (email.includes('@.') || email.includes('.@')) {
      throw this.httpExceptionBuilder(
        '@ and . Symbol Cannot Be Adjacent With Each Other',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(dto: RegisterDto) {
    const validUsername = this.validateLength(dto.username, 4, 40);
    if (!validUsername) {
      throw this.httpExceptionBuilder(
        'Username Must Be Between 4-40 Characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.validateEmail(dto.email);

    const uniqueEmail = await this.isEmailUnique(dto.email);
    if (!uniqueEmail) {
      throw this.httpExceptionBuilder(
        'Email Must Be Unique',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validatePassword(dto.password);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email,
        country: dto.country,
      },
    });
    return {
      user: {
        id: user.userId,
        username: user.username,
        email: user.email,
        country: user.country,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email;
    const password = dto.password;

    if (email == '' || password == '') {
      throw this.httpExceptionBuilder(
        'All Fields Must Be Filled!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (user == null) {
      throw this.httpExceptionBuilder(
        'Invalid Credentials!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      const token = this.jwtService.sign({
        userId: user.userId,
        role: user.role,
      });
      return {
        token: token,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
      };
    } else {
      throw this.httpExceptionBuilder(
        'Invalid Credentials!',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
