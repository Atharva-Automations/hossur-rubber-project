import { IsString } from "class-validator";

export class ScanQcDto {
  @IsString()
  qrId!: string;
}
