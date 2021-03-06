import {Request, Response} from 'express';
import Knex from '../database/connection';

class ItemsController {
    async index(request: Request, response: Response) {   // Consultar itens
        const items = await Knex('items').select('*');    // Seleciona todos os elelementos da tabela "itens"
    
        const serializedItems = items.map( item => { // Percorre todos os itens e permite modificá-los
            return {
                id: item.id,
                title: item.title,
                //image_url: `http://localhost:3333/uploads/${item.image}`,   // Para o frontend
                image_url: `http://192.168.1.103:3333/uploads/${item.image}`, // Para ficar visível na rede para o Smartphone
            };
        });      
        return response.json(serializedItems);
    }
}

export default ItemsController;