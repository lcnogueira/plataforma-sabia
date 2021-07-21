const BaseValidator = use('App/Validators/BaseValidator');

class UpdateUser extends BaseValidator {
	get rules() {
		return {
			full_name: 'string',
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
			areas: 'array|max:4',
			'areas.*': 'number|exists:knowledge_areas,knowledge_area_id',
		};
	}
}

module.exports = UpdateUser;
