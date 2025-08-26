import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) { }

  async getNewProduct(): Promise<any> {
    const nuevosProductos = await this.databaseService.executeQuery(`
      SELECT 
        p.idProducto, 
        p.categoria, 
        p.marca, 
        p.nombre,
        p.precio, 
        p.descripcion, 
        p.imagen, 
        p.nuevo, 
        p.masVendido, 
        p.activo, 
        GROUP_CONCAT(DISTINCT fp.url_foto ORDER BY fp.idFoto SEPARATOR ',') AS fotosAdicionales
      FROM productos p
      LEFT JOIN fotosproductos fp ON p.idProducto = fp.idProducto
      WHERE p.nuevo = 1
      GROUP BY p.idProducto
      ORDER BY RAND()
      LIMIT 8;`);

    return nuevosProductos || null;
  }
}
