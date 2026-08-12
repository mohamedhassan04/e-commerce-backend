import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { ISwaggerConfigInterface } from './swagger-config.interface';

export function setupSwagger(
  app: INestApplication,
  config: ISwaggerConfigInterface,
) {
  if (process.env.NODE_ENV === 'production') return;

  const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .addServer(`${config.scheme}://localhost:8080`)
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(config.path, app, document, {
    swaggerOptions: { withCredentials: true },
  });
}
