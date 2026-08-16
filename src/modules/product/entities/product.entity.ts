import { Node } from 'src/shared/node/common.entity';
import { Entity } from 'typeorm';

@Entity('tb_products')
export class Product extends Node {}
