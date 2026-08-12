import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { Users } from 'src/modules/user/entities/user.entity';

export const GetUser = createParamDecorator<string>(
  (data: string, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest();
    const user = request?.user?.user as any;
    return user;
  },
);
