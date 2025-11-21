import { IsEmail, IsString } from 'class-validator';

export class MemberActivationDto {
    @IsEmail()
    email!: string;

    @IsString()
    code!: string;
}
