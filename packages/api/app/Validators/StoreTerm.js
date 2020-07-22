const BaseValidator = use('App/Validators/BaseValidator');

class StoreTerm extends BaseValidator {
	get rules() {
		return {
			term: 'required|string',
			taxonomy: 'required',
			meta: 'array',
			'meta.*.meta_key': 'required_if:meta|string',
			'meta.*.meta_value': 'required_if:meta|string',
		};
	}
}

module.exports = StoreTerm;
