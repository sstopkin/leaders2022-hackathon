import { Test, TestingModule } from '@nestjs/testing';
import { UserControllerCrud } from './user.controller-crud';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserControllerCrud;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserControllerCrud],
      providers: [UserService],
    }).compile();

    controller = module.get<UserControllerCrud>(UserControllerCrud);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
