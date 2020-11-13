describe('technology form validation', () => {
	beforeEach(() => {
		cy.authenticate().visit('/technology/new');
	});
	it('step 1 - must fill required fields', () => {
		cy.get('input[name=title]').type('Minha tecnologia');
		cy.get('textarea[name=description]').type('Descrição da tecnologia');
		cy.findByText(/salvar e continuar/i).click();
		cy.findAllByText(/este campo é obrigatório/i).should('exist');
	});
	it('step 1 - selecting a category renders subcategories', () => {
		cy.findByText(/escolha uma categoria primeiro/i).should('exist');
		cy.select('terms.category', { exactMatch: true, position: 1 });
		cy.findByText(/escolha uma categoria primeiro/i).should('not.exist');
		cy.findByText(/escolha a sub categoria/i).should('exist');
	});
});

describe('technology input form help', () => {
	beforeEach(() => {
		cy.authenticate().visit('/technology/new');
	});
	it('opens the help modal when its icon is clicked', () => {
		cy.get('span[name="help_button"]')
			.first()
			.click();
		cy.findByText(/a maturidade da tecnologia será medida utilizando a escala TRL/i).should(
			'exist',
		);
	});
	it('closes the help modal when the backdrop is clicked', () => {
		cy.get('span[name="help_button"]')
			.first()
			.click();
		cy.findByText(/a maturidade da tecnologia será medida utilizando a escala TRL /i).should(
			'exist',
		);
		cy.get('[name="help_modal_backdrop"]').click({ force: true });
		cy.findByText(/a maturidade da tecnologia será medida utilizando a escala TRL /i).should(
			'not.exist',
		);
	});
});

describe('creating/editing technology', () => {
	beforeEach(() => {
		cy.authenticate().visit('/technology/new');
	});

	it('redirects /technology/new if technology does not exist or does not belong to user', () => {
		cy.visit('/technology/9999/edit/about');
		cy.url().should('include', 'technology/new');
	});

	it('filling all fields creates an technology', () => {
		cy.fixture('technology.json').then((technologyData) => {
			cy.get('input[name=title]').type(technologyData.title);
			cy.get('textarea[name=description]').type(technologyData.description);

			cy.get('label[for=intellectual_property]').click();
			cy.get('label[for=patent]').click();
			cy.select('target_audience');
			cy.select('biome');
			cy.select('government_program');

			// selecting two keywords
			cy.select('keywords');
			cy.select('keywords');

			cy.select('stage');
			cy.select('classification');
			cy.select('dimension');
			cy.select('terms.category', { exactMatch: true, position: 1 });
			cy.findByText(/escolha uma categoria primeiro/i).should('not.exist');
			cy.select('subcategory');

			cy.findByText(/salvar e continuar/i).click();
			cy.url().should('include', 'edit');
			cy.url().should('include', 'technology');

			cy.get('[name=primary_purpose]').type(technologyData.primary_purpose);
			cy.get('[name=secondary_purpose]').type(technologyData.secondary_purpose);
			cy.get('[name=application_mode]').type(technologyData.application_mode);
			cy.get('[name=installation_time]').type(technologyData.installation_time);
			cy.get('[name=solves_problem]').type(technologyData.solves_problem);
			cy.get('[name=entailes_problem]').type(technologyData.entailes_problem);
			cy.get('[name=requirements]').type(technologyData.requirements);
			cy.get('[name=risks]').type(technologyData.risks);
			cy.get('[name=contribution]').type(technologyData.contribution);

			cy.findByText(/salvar e continuar/i).click();

			cy.get('[name="technologyCosts.costs.implementation_costs_add_button"]').click();
			cy.get('[name="technologyCosts.price"]').type('500');
			cy.get('label[for="technologyCosts.is_seller"]').click();
			cy.get('[name="technologyCosts.costs.implementation_costs[0]_remove_button"').should(
				'exist',
			);

			cy.get('[name="technologyCosts.costs.implementation_costs[0].description"]').type(
				'coolest description',
			);
			cy.get('[name="technologyCosts.costs.implementation_costs[0].quantity"]').type('2');
			cy.get('[name="technologyCosts.costs.implementation_costs[0].value"]').type('20');
			cy.select('technologyCosts.costs.implementation_costs[0].type');
			cy.select('technologyCosts.costs.implementation_costs[0].measure_unit');
			cy.findAllByText(/40,00/i).should('exist');

			cy.get('[name="technologyCosts.costs.implementation_costs_add_button"]').click();
			cy.get('[name="technologyCosts.costs.implementation_costs[1]_remove_button"').should(
				'exist',
			);

			cy.get('[name="technologyCosts.costs.implementation_costs[1].description"]').type(
				'coolest description',
			);
			cy.get('[name="technologyCosts.costs.implementation_costs[1].quantity"]').type('3');
			cy.get('[name="technologyCosts.costs.implementation_costs[1].value"]').type('7');
			cy.select('technologyCosts.costs.implementation_costs[1].type');
			cy.select('technologyCosts.costs.implementation_costs[1].measure_unit');
			cy.findAllByText(/21,00/i).should('exist');
			cy.findAllByText(/61,00/i).should('exist');

			cy.get('[name="technologyCosts.costs.maintenance_costs_add_button"]').click();
			cy.get('[name="technologyCosts.costs.maintenance_costs[0]_remove_button"').should(
				'exist',
			);

			cy.get('[name="technologyCosts.costs.maintenance_costs[0].description"]').type(
				'coolest description 3',
			);
			cy.get('[name="technologyCosts.costs.maintenance_costs[0].quantity"]').type('3');
			cy.get('[name="technologyCosts.costs.maintenance_costs[0].value"]').type('45');
			cy.select('technologyCosts.costs.maintenance_costs[0].type');
			cy.select('technologyCosts.costs.maintenance_costs[0].measure_unit');
			cy.findAllByText(/135,00/i).should('exist');

			cy.get('label[for="technologyCosts.funding_required"]').click();
			cy.select('funding_type');
			cy.get('[name="technologyCosts.funding_value"]').type('15000');
			cy.select('funding_status');

			cy.findByText(/salvar e continuar/i).click();

			cy.technologyFormFillInNResponsible();

			cy.findByText(/salvar e continuar/i).click();

			cy.select('where_can_be_applied');

			cy.findByText(/salvar e continuar/i).click();

			cy.findByText(new RegExp(technologyData.title, 'i')).should('be.visible');
			cy.findByText(/salvar e continuar/i, { selector: 'button' }).should('not.exist');
			cy.findByText(/voltar/i, { selector: 'button' }).should('exist');

			cy.get('textarea[name=comment]').type('To uhibewcuv le roos leotine.');

			cy.get('label[for=acceptTrueInformationTerms]').click();
			cy.get('label[for=acceptResponsibilityTerms]').click();
			cy.get('label[for=acceptRespectRightsTerms]').click();
			cy.get('label[for=acceptJudicialAccountabilityTerms]').click();

			cy.findByText(/concluir/i, { selector: 'button' })
				.should('exist')
				.click();

			const toastMessage = /sua tecnologia foi cadastrada com sucesso e enviada para análise da equipe de curadores\. você será redirecionado para as suas tecnologias para acompanhar o processo de revisão\./gim;

			cy.findByText(toastMessage).should('exist');

			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(6000);

			cy.findByText(toastMessage).should('not.exist');
			cy.url().should('include', '/user/my-account/technologies');
		});
	});
});
