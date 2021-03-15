const BaseValidator = use('App/Validators/BaseValidator');

class UpdateUser extends BaseValidator {
	get rules() {
		return {
			zipcode: 'number',
			cpf: 'number|cpf',
			birth_date: 'date',
			phone_number: 'string',
			institution_id: 'number|exists:institutions,id',
			lattes_id: 'number',
			address: 'string',
			address2: 'string',
			district: 'string',
			city: 'string',
			state: 'string',
			country: 'string',
			areas: 'array|max:4',
			'areas.*': 'number|exists:knowledge_areas,knowledge_area_id',
		};
	}
}

module.exports = UpdateUser;
