/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Technology = use('App/Models/Technology');

class TechnologyController {

    async index(){
        const technologies = Technology.all();
        
        return technologies;
    }

    async show({params}){
        const technologies =  await Technology.findOrFail(params.id);

        return technologies;
    }

    async destroy({params, response}){
        const technology = await Technology.findOrFail(params.id);

        if (!technology) {
          return response.status(401).send({ error: 'Not found!' });
        }
      
        await technology.delete();
    }

    async store({ request }){
        const data = request.all(['title', 'initials', 'description', 'logo', 'site_url', 'private']);
            
        const technology = await Technology.create({ ...data });

        return technology;
    }

    async update({ params, request }){
        const technology =  await Technology.find(params.id);

        const data = request.all();

        technology.merge(data);
        technology.save();
        
        return technology;
    }
}

module.exports = TechnologyController;