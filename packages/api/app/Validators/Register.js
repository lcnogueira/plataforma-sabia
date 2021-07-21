const BaseValidator = use('App/Validators/BaseValidator');

class Register extends BaseValidator {
	get rules() {
		return {
			// validation rules
			email: 'required|email|unique:users',
			password: 'required|string',
		};
	}
}

module.exports = Register;
