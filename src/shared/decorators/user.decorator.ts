import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator<string>(
  (data: string, context: ExecutionContext): Users => {
    const request = context.switchToHttp().getRequest();
    const user = request?.user?.id as Users;
    return user;
  },
);
