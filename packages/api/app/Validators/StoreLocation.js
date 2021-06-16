const BaseValidator = use('App/Validators/BaseValidator');

class StoreLocation extends BaseValidator {
	get rules() {
		return {
			place_id: 'string|unique:locations',
			address: 'required|string',
			city_id: 'number|exists:cities,id',
			lat: 'required|string',
			lng: 'required|string',
		};
	}
}

module.exports = StoreLocation;
