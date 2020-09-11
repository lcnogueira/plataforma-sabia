describe('technology details', () => {
	let technology;

	before(() => {
		cy.request('GET', 'http://localhost:3333/technologies?embed', {
			perPage: 1,
		}).then((response) => {
			cy.expect(response.status).to.equal(200);
			technology = response.body[0];
		});
	});

	it('should list details', () => {
		cy.visit(`/t/${technology.slug}`);

		cy.signIn();

		cy.findAllByText(new RegExp(technology.title, 'i')).should('exist');
		cy.findAllByText(new RegExp(technology.description, 'im')).should('exist');

		if (technology.thumbnail?.url) {
			cy.findByTestId('image')
				.should('be.visible')
				.should('have.attr', 'src')
				.should('include', technology.thumbnail.url);
		}

		/**
		 * Tabs
		 */
		cy.findByTestId('description')
			.should('exist')
			.click();

		cy.findAllByText(/onde é a aplicação/i).should('be.visible');
		cy.findAllByText(/objetivo principal/i).should('be.visible');
		cy.findAllByText(/problemas que a tecnologia soluciona/i).should('be.visible');
		cy.findAllByText(/contribuição para o semiárido/i).should('be.visible');
		cy.findAllByText(/riscos associados à tecnologia/i).should('be.visible');

		cy.findByTestId('review')
			.should('exist')
			.click();

		cy.findByTestId('costs')
			.should('exist')
			.click();

		cy.findAllByText(/custos da tecnologia/i).should('be.visible');
		cy.findAllByText(/custo de desenvolvimento/i).should('be.visible');
		cy.findAllByText(/custos de implantação/i).should('be.visible');
		cy.findAllByText(/custos de manutenção/i).should('be.visible');

		cy.findByTestId('attachments')
			.should('exist')
			.click();

		cy.findAllByText(/fotos/i).should('be.visible');
		cy.findAllByText(/documentos/i).should('be.visible');
	});

	it('should see costs tables only when user is logged in', () => {
		cy.visit(`/t/${technology.slug}`);

		cy.findAllByText(/custos e financiamento/i)
			.should('exist')
			.click();

		cy.findAllByText(/custos da tecnologia/i).should('be.visible');

		cy.findAllByText(/custo de desenvolvimento/i).should('not.exist');
		cy.findAllByText(/custos de implantação/i).should('not.exist');
		cy.findAllByText(/custos de manutenção/i).should('not.exist');

		cy.findAllByText(/^(entrar|sign in)$/i).should('be.visible');

		cy.signIn({ openModal: false });

		cy.findAllByText(/custo de desenvolvimento/i).should('be.visible');
		cy.findAllByText(/custos de implantação/i).should('be.visible');
		cy.findAllByText(/custos de manutenção/i).should('be.visible');
	});

	it('should redirect to the error page when the technology is not found', () => {
		const unknownTechnology = 'a';

		cy.visit(`/t/${unknownTechnology}`, {
			failOnStatusCode: false,
		});
		cy.url().should('match', /_error.js/);
		cy.findAllByText('404').should('exist');
	});
});
