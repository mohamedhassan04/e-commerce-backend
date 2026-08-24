import { AuthenticationModule } from 'src/modules/auth/auth.module';
import { ProductModule } from 'src/modules/product/product.module';
import { UsersModule } from 'src/modules/users/users.module';

export const AllModules = [AuthenticationModule, UsersModule, ProductModule];
