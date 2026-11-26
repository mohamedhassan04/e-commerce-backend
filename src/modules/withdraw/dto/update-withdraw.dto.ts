import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { WithdrawStatus } from 'src/shared/enum/enum.type';
import { CreateWithdrawDto } from './create-withdraw.dto';

export class UpdateWithdrawDto extends PartialType(CreateWithdrawDto) {
  @ApiPropertyOptional({
    description: 'Handling status of the withdrawal request',
    enum: WithdrawStatus,
    default: WithdrawStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(WithdrawStatus)
  status?: WithdrawStatus;
}
