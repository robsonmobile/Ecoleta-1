import {Request, Response} from 'express';
import Knex from '../database/connection';

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)       // Força os itens a se tornarem uma string
            .split(',')                         // corta nas vírgulas
            .map(item => Number(item.trim()));  // Remove os espaços dos elmentos

        const points = await Knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

            const serializedPoints = points.map( point => { // Percorre todos os itens e permite modificá-los
                return {
                    ...point,
                    image_url: `http://192.168.1.103:3333/uploads/${point.image}`, // Para ficar visível na rede para o Smartphone
                };
            });      
        
        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await Knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found.'});
        }

        const serializedPoint =  { 
            ...point,
            image_url: `http://192.168.1.103:3333/uploads/${point.image}`,
        };

        const items = await Knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');
            // select * from items
            // join point_items ON items.id = point_items.item_id
            // where point_items.point_id = {id}

        return response.json({point : serializedPoint, items});
    }

    async create(request: Request, response: Response) {
        const {     // desestruturação do item   (const name = request.body.name)
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } =  request.body;
    
        const trx = await Knex.transaction();       // Garante que toda a operaçõa será executada, ou caso alguma falhe, cancele

        const point = {   // short sintaxe (quando o nome da variável é igual da prpopriedade do objeto)
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map( (item_id: number) => {    // relaciona o ponto com os elementos que ele vai coletar
                return {
                    item_id,
                    point_id: point_id,
                }
        });
    
        await trx('point_items').insert(pointItems);

        await trx.commit();
        return response.json({
            id: point_id,
            ... point,  //passa todos os valores do elemento
        });
    }
}


export default PointsController;