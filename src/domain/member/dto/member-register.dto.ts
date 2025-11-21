import { IsEmail, IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MemberRegisterDto {
    @IsString()
    nickname!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    // optional numeric region id
    // class-transformer converts incoming string to number
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    region_id?: number;
}
