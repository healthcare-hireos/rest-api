import {  IsNumber, IsOptional, IsString } from 'class-validator';

export class OfferFilterDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsNumber()
  @IsOptional()
  salary_from?: number;

  @IsNumber()
  @IsOptional()
  salary_to?: number;

  @IsNumber()
  @IsOptional()
  agreement_type_id: number;

  @IsNumber()
  @IsOptional()
  profession_id: number;

  @IsNumber()
  @IsOptional()
  specialization_id: number;

  @IsNumber()
  @IsOptional()
  company_id: number;
}