import { Body, Controller, Get, HttpStatus, Post, Put, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/backendApi/features-products')
  async getNewProduct(
    @Query('feature') feature: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.appService.getNewProduct(feature);

      return res.status(HttpStatus.OK).json(data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get('/backendApi/product-by-category')
  async getProductByCategory(
    @Query('category') category: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.appService.getProductByCategory(category);

      return res.status(HttpStatus.OK).json(data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
