import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { UserRole } from './entities/user.role';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  @ApiOperation({ summary: 'Return all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  @ApiOperation({ summary: 'Return the authorized user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async findMe(@Request() req): Promise<User> {
    return req.user;
  }

  @Get(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  @ApiOperation({ summary: 'Return a user with specified id' })
  @ApiParam({
    name: 'id',
    required: true,
    allowEmptyValue: false,
    description: 'User identifier',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard([UserRole.ADMIN]))
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  create(
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN]))
  @ApiOperation({ summary: 'Update a user with specified id' })
  @ApiParam({
    name: 'id',
    required: true,
    allowEmptyValue: false,
    description: 'User identifier',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN]))
  @ApiOperation({ summary: 'Disable a user with specified id' })
  @ApiParam({
    name: 'id',
    required: true,
    allowEmptyValue: false,
    description: 'User identifier',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
