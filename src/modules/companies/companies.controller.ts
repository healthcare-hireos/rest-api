import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Company } from './entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompanyDto, LocationWithUserDto } from './dto/company.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetAuthorizedUser } from '../../common/decorators/getAuthorizedUser.decorator';
import { User } from '../auth/user.entity';
import { S3ManagerService } from '../../common/services/s3-manager.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from '../../common/interfaces/file.interface';

@Controller('companies')
export class CompaniesController {
  constructor(
    private companyService: CompaniesService,
    private s3ManagerService: S3ManagerService,
  ) {}

  @Get()
  @HttpCode(200)
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @UseGuards(AuthGuard())
  @Get('by-user')
  @HttpCode(200)
  findUserCompany(@GetAuthorizedUser() user: User) {
    return this.companyService.findByUserId(user.id);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param() { id }): Promise<Company> {
    return this.companyService.findOne(id);
  }

 


  @UseGuards(AuthGuard())
  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @Body() data: CompanyDto,
    @GetAuthorizedUser() user: User,
  ): Promise<Company> {
    return this.companyService.create({
      ...data,
      user_id: user.id,
    });
  }

  @UseGuards(AuthGuard())
  @Put()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Body() data: CompanyDto, @GetAuthorizedUser() user: User) {
    return this.companyService.update({
      ...data,
      user_id: user.id,
    });
  }

  @UseGuards(AuthGuard())
  @Post('photo')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async createPhoto(
    @UploadedFile() file: File,
    @GetAuthorizedUser() user: User,
  ) {
    const company = await this.companyService.findByUserId(user.id);

    const upload = await this.s3ManagerService
      .uploadFile('photos', file)
      .catch(() => {
        throw new BadRequestException(
          'There was problem during uploading file',
        );
      });

    return this.companyService.createPhoto({
      name: file.originalname,
      file_path: upload.Location,
      company_id: company.id,
    });
  }

  @UseGuards(AuthGuard())
  @Delete('photo/:id')
  @HttpCode(204)
  async deletePhoto(@Param() { id: photoId }, @GetAuthorizedUser() user: User) {
    const company = await this.companyService.findByUserId(user.id);
    const photo = await this.companyService.findOnePhoto(photoId, company.id);

    if (!photo) {
      throw new BadRequestException(`There is no photo with given id`);
    }

    await this.s3ManagerService.removeFile(photo.file_path).catch(() => {
      throw new BadRequestException('There was problem during deleting file');
    });

    return this.companyService.deletePhoto(photo.id);
  }

  @UseGuards(AuthGuard())
  @Post('location')
  @HttpCode(201)
  async createLocation(
    @GetAuthorizedUser() user: User,
    @Body() data: LocationWithUserDto
  ) {
    return this.companyService.createLocation({...data, user_id: user.id});
  }

  @UseGuards(AuthGuard())
  @Delete('location/:id')
  @HttpCode(201)
  async deleteLocation(
    @GetAuthorizedUser() user: User,
    @Param() { id }
  ) {
    return this.companyService.deleteLocation(id, user)
  }

  @UseGuards(AuthGuard())
  @Post('upload-logo')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: File,
  ) {

    const upload = await this.s3ManagerService
      .uploadFile('logos', file)
      .catch(() => {
        throw new BadRequestException(
          'There was problem during uploading file',
        );
      });


    return { file_path: upload.Location };
  }
}