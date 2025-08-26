import { Body, Controller, Get, HttpStatus, Post, Put, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/backendApi/new-products')
  async getNewProduct(
    @Res() res: Response,
  ) {
    try {
      const data = await this.appService.getNewProduct();

      return res.status(HttpStatus.OK).json(data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
