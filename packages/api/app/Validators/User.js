const BaseValidator = use('App/Validators/BaseValidator');

class User extends BaseValidator {
	get rules() {
		return {
			email: 'required|email|unique:users',
			first_name: 'required_without_all:full_name',
			full_name: 'required_without_all:first_name',
			password: 'required|string',
			zipcode: 'number',
			cpf: 'number|cpf',
			birth_date: 'date',
			phone_number: 'string',
			institution_id: 'number|exists:institutions,id',
			lattes_id: 'number',
			address: 'string',
			address2: 'string',
			district: 'string',
			city_id: 'number|exists:cities,id',
			state_id: 'number|exists:states,id',
			country: 'string',
			disclaimers: 'array', // required|
			'disclaimers.*': 'number', // |exists:disclaimers,id
			areas: 'array',
			'areas.*': 'number|exists:knowledge_areas,knowledge_area_id',
		};
	}
}

module.exports = User;
