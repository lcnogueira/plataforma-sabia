import fetchMock from 'fetch-mock-jest';
import {
	createTechnology,
	getAttachments,
	getTechnologies,
	getTechnology,
	getTechnologyCosts,
	getTechnologyTerms,
	getReviews,
	updateTechnology,
	updateTechnologyCosts,
	updateTechnologyResponsibles,
} from '../technology';
import {
	prepareTerms,
	normalizeTerms,
	normalizeCosts,
	normalizeTaxonomies,
	normalizeAttachments,
} from '../../utils/technology';
import { baseUrl } from '../api';

const termsData = [
	{
		id: 7,
		term: 'Ambiental',
		slug: 'ambiental',
		parent_id: null,
		taxonomy_id: 5,
		created_at: '2020-07-29 08:14:21',
		updated_at: '2020-07-29 08:14:21',
		taxonomy: {
			id: 5,
			taxonomy: 'DIMENSION',
			description: 'Dimensão da Tecnologia',
			created_at: '2020-07-29 08:14:21',
			updated_at: '2020-07-29 08:14:21',
		},
		pivot: { term_id: 7, technology_id: 21 },
	},
	{
		id: 47,
		term: 'Áreas Degradadas',
		slug: 'areas-degradadas',
		parent_id: null,
		taxonomy_id: 1,
		created_at: '2020-07-29 08:14:21',
		updated_at: '2020-07-29 08:14:21',
		taxonomy: {
			id: 1,
			taxonomy: 'CATEGORY',
			description:
				'Categoria a qual pertence a tecnologia. Se o termo possuir um pai (parent_id), trata-se de uma subcategoria',
			created_at: '2020-07-29 08:14:21',
			updated_at: '2020-07-29 08:14:21',
		},
		pivot: { term_id: 47, technology_id: 21 },
	},
	{
		id: 51,
		term: 'Recuperação de bacias hidrográficas',
		slug: 'recuperacao-de-bacias-hidrograficas',
		parent_id: 47,
		taxonomy_id: 1,
		created_at: '2020-07-29 08:14:21',
		updated_at: '2020-07-29 08:14:21',
		taxonomy: {
			id: 1,
			taxonomy: 'CATEGORY',
			description:
				'Categoria a qual pertence a tecnologia. Se o termo possuir um pai (parent_id), trata-se de uma subcategoria',
			created_at: '2020-07-29 08:14:21',
			updated_at: '2020-07-29 08:14:21',
		},
		pivot: { term_id: 51, technology_id: 21 },
	},
];

const taxonomiesData = {
	dimension: 'Ambiental',
	category: 'Áreas Degradadas, Recuperação de bacias hidrográficas',
};

const costsData = {
	id: 1,
	funding_required: 1,
	funding_type: 'Ju22cChPiH@fQ0',
	funding_value: 91305664,
	funding_status: 'C3uZR',
	notes:
		'Ti uzhi wiveuw vop dojvocep lasdu ki noskur loikdo gewtek obeit canvutaru. Geziz zovujsen ja dokki tow hobafa kumimen noha amozunvi oku keplus tabcejbah mejmoja moev zowhoozo nanmafwez bisufeka. Coduc ri joan mipde naw casne eduzos li kijutek bihmitev niphov seka kola zuf gipo. Nuwim totsete fegeone sij va ahfev awo dun tibefe rualegef le hu ohura ehli cifven cihuc jeulu cudwuhid.',
	technology_id: 1,
	created_at: '2020-07-25 10:09:02',
	updated_at: '2020-07-25 10:09:02',
	costs: [
		{
			id: 1,
			cost_type: 'maitenance_costs',
			description: 'Eku ozdojeh oka gaminare mif be batju sewnotud naupgeb siswiv.',
			type: 'material',
			quantity: 76,
			value: 83149705,
			technology_cost_id: 1,
			created_at: '2020-07-25 10:09:02',
			updated_at: '2020-07-25 10:09:02',
		},
		{
			id: 2,
			cost_type: 'development_costs',
			description: 'Lesahav ceehi fosded get nuppid dowal mobije tinjup revvovat gajewigit.',
			type: 'service',
			quantity: 39,
			value: 87936918,
			technology_cost_id: 1,
			created_at: '2020-07-25 10:09:02',
			updated_at: '2020-07-25 10:09:02',
		},
		{
			id: 3,
			cost_type: 'development_costs',
			description: 'Pu ulte sabeju me tosuzid ofulu lurek ni ikdodgim nukfuv.',
			type: 'material',
			quantity: 16,
			value: 16348837,
			technology_cost_id: 1,
			created_at: '2020-07-25 10:09:02',
			updated_at: '2020-07-25 10:09:02',
		},
	],
};

const technologyEndpoint = `path:/technologies`;

const technologyData = {
	title: 'Gesbib powev sodzomjik.',
	slug: 'gesbib-powev-sodzomjik.',
	description:
		'Kodopifi sammehor voecara wu dietu je zedsande lo nemnoriv zi metoeju na bajo. Dulzo cedjev per zigru mi zufdus igfum vetek zub aw tug kor. Ehava tedorid ufmu ado buwlat kegogafub guh goga uwwev cojijhe gifiru vo. Fomob op per zezipu leguzber sitzijse wifdo zar nagojek tiuni cu pulovamu opjo dif cop ven inu.',
	private: 0,
	thumbnail: 'https://rocketfinalchallenge.s3.amazonaws.com/card-image.jpg',
	likes: 15,
	patent: 1,
	patent_number: 'iJuXXxRQ',
	primary_purpose:
		'Fobsomir ikepet icpu cickavcib wedug wocpun rajatoc urogidim cic bufja tojaw olzi guseczo ti magife liz pufbuccud ruhodege. Puc ji pa li hathunag zewsofa hoprikce mustij pikok lisu laf itzema caj ufuotowuv badna ceogih wugegpi agota. Jef fa sawodguh jorgaj godilwi runvuf edkide ajnoozu urken ol sawki pus wa hikmono labzik vitmosu. Ni ripu hekgo woshuc pujuuf dos vop sasec uweiwcu wa tibofawo irbojep ge dovacoc dov orolof do. Te luddiig tompowake ojcovo lijedek gi fubifep lidafper aza wewserdel ro reit jim cukejru lec fa.',
	secondary_purpose:
		'Of date vemcodnig gubkeji uzato ro lohju kibala wofjispag voref ezeju je sew. Gosevza tu ded rujbad zihve tughin maj sid iw mujlahho sawki lusramsi ki ra wuwimef. Hugwe wom ibudowev ca vowkih leti nudvawo fap emagufhus mu es zaojib hu. Buggofi ujiwibe abeemohah bugikif kutwavoc weh ole defteh vot aji wa vevdinin ju. Ubzashiz tiregfec lugiprun ijelumza fa ehurvu boklo ake ego cuvode ekve vu.',
	application_mode:
		'Li ca ceapeabo tovimi igtilezo udpuz uga su uzo cuhi sece pikanaki ibuge fat nibifoha akebucoc. Cise awa bajgigef gokul kog kuvad coabges hadaz etu uhnen bu tom rub hiwevu rumluje ciljes joohu bewupev. Um fo fucuec ivfutib mela nu jum eluodan uhufe ineal decehaop bozham lupgudzo. Ruces menuk lishabsod pub uvi labi al vur sagdobnul revce zivlogit ta. Semi kunut urremuh lopkoite uniruce di kijzon gemladlot hulivli dacvukog foitauke pahvila wic vit. Carkis jacuger isi rov nabiref fuzhupe ninpus kukooha tu bicfuk wotekovo kodfacif buwrat law.',
	application_examples:
		'Acuce id sootodoc nepzes hi towdew ibpavok tazgab vo obajeka orsuz wobegoj be ir. Waarzi ugiukle ireiwapu ta muczil utupor zahtobe fomal orasebda fa jucaktuv ra ka ef mef apu buejuca. Suw eciwazo dargak diizzi jikiti fol gil jeewte na ec atu gipoh cocpep bigawera kapapoc cagnumvog pub epete. Fegded bac wefen juufi wat opdefno rupiive zoczu raube soeme laf jedbas lufkeh jolul. Gasriktal isasul owe pielu ku humahto oj pe wige zaj ulo ulsut uw ku uconu mil. Bez gozdiltow motzigid guol cima miludajeh hetolme ep mek riftitcuz uwora ki loefo putfu rimob ahadivmup ceskoleg. Tundarot to vikemuru velola ge veh ra hisaza bel etemsun rage zaabriv ope omugoki.',
	installation_time: 34,
	solves_problem:
		'Bigzacu cien wekgeg jivmu dorcuze iwuuzoza lik kiji daha hojuzi vo motwu teh ge gawlupo pat. Omhouc aji lohud da zirfod focera hikomak tujelug janfep ha gudiub kiwuwpe rubdinen je gikorem isafanin jailfiv pe. Sobouw dih tes mehrebfek huboggi livek rof tudmak agi ke afeida vopuv kicme esa nejtuj onule ajeav.',
	entailes_problem:
		'Bimpa havla ibru tus sogjo dezecaw jozto kosedzo rakhojup gatsud obe ginmavvan le zeh. Nerhahih ujowin sitseit moh obu inheg an am waog bok julmerak hahro anestav obkak rafhil amo kodhigebi. Pedku pot hadiv ke piso wi ri darrafso guti bonmu jalafu ite jopkirwap ehbe wuc.',
	requirements:
		'Kemferuh maddovo om gil fah ko insejri hepfehu rissuno munubu bun ogainema vele ca. Cutriri banev widatwa situr us tu fuofabu zup hov gu otocewmig vumwojo. Og butabe azilo woh ruiboki esaridwo de wuflul owa vor bakozba it leracso. Huobuha sefruv zinge cocjab ih cauh vi weka wo dinofpo fad gav va ana. Nad ibvizrut lurunsor rifnif mi nanoida nazuri ictu eve lujjegru cof jirukuzo ralupe jumab zutuv toh.',
	risks:
		'Goel sozuhpid mol ep doznagwik vujravopi sikolo mofaz nusjifug adoduuv go kofosi uwuew paluv ibo. Sen torah se wozuno wupbode jiob fihef ewa zamel vecuptec pi suwne hubotohob kuv duane rejlaari lunapepi. Uvja laek ujhearo nuiwto ezeci pe uboru sac lohtuzida tudose ukizene wetioza fabkutewu to popcofaca oba. Hepma wuid so lodketul zu jobew tozen kalolam elomapi tovatozur bo mirog tuhokipi ruwri ugeron husab hugugru afunu. Ze bu waivza ebuhifol diji wo gomerrac dowfevin iza ruatusi bude ju hufhop fomwer me.',
	contribution:
		'Ru egefuhge oka foscekew uvi mijuw buhoc urewe gicozru orujumfa jo pu nohena seb tas ka oftaidu jawuag. Fozok ga week zopuloz jipema ogidonjob bi zeb beronu hovro bu kuviw arnac zug owiko colopjif. Fumkus ospappa kaze moare das ka hap fofimwog zodowpag tavofut ehhiken kekuzar kobik fu zodgi erogi tuvaosi. Onebo miwi niab dituwsaj sanajo woz uzjah hi unu mirezki wewbuuzu hoboheho er mel. Uzicidicu rofhuzip nugu okwansiw igoes dumpasfu fibizov de puc ne raznagve bilawo isew. Nufneflu ki gouje laldav akapu no ilolinid umopa mem ka vosuz paran venit jibifiveb jeniolu. Agoihsi mit fe sogovo bal ewuhivol rejavnu vuzunan ju suk walobwom esakic.',
	terms: [
		{
			id: 75,
			term: 'Prefeituras',
			slug: 'prefeituras',
			parent_id: null,
			taxonomy_id: 6,
			created_at: '2020-07-26 00:46:50',
			updated_at: '2020-07-26 00:46:50',
			taxonomy: {
				id: 6,
				taxonomy: 'TARGET_AUDIENCE',
				description: 'Público-alvo da tecnologia',
				created_at: '2020-07-26 00:46:50',
				updated_at: '2020-07-26 00:46:50',
			},
			pivot: {
				term_id: 75,
				technology_id: 1,
			},
		},
		{
			id: 73,
			term: 'Empresários',
			slug: 'empresarios',
			parent_id: null,
			taxonomy_id: 6,
			created_at: '2020-07-26 00:46:50',
			updated_at: '2020-07-26 00:46:50',
			taxonomy: {
				id: 6,
				taxonomy: 'TARGET_AUDIENCE',
				description: 'Público-alvo da tecnologia',
				created_at: '2020-07-26 00:46:50',
				updated_at: '2020-07-26 00:46:50',
			},
			pivot: {
				term_id: 73,
				technology_id: 1,
			},
		},
		{
			id: 76,
			term: 'Caatinga',
			slug: 'caatinga',
			parent_id: null,
			taxonomy_id: 7,
			created_at: '2020-07-26 00:46:50',
			updated_at: '2020-07-26 00:46:50',
			taxonomy: {
				id: 7,
				taxonomy: 'BIOME',
				description: 'Bioma no qual se insere a tecnologia (Caatinga, Zona da Mata, etc)',
				created_at: '2020-07-26 00:46:50',
				updated_at: '2020-07-26 00:46:50',
			},
			pivot: {
				term_id: 76,
				technology_id: 1,
			},
		},
	],
	technologyCosts: costsData,
};

const termsFormData = {
	category: [
		{ label: 'Category 1', value: 2 },
		{ label: 'Category 2', value: 3 },
	],
	stage: { label: 'Stage 1', value: 5 },
};

const reviewsData = [
	{
		id: 1,
		user_id: 1,
		technology_id: 1,
		content: 'To uhibewcuv le roos leotine.',
		rating: 3,
		positive: ['Pubhotsa tecedru.', 'Gi oc utiol.'],
		negative: ['Zicofzal ivi.', 'Tohisala bem.'],
		user: {
			id: 1,
			full_name: 'João',
			company: 'Ufersa',
			city: 'Mossoró',
			state: 'RN',
			country: 'Brasil',
		},
	},
];

const attachmentsData = {
	raw: [
		{
			id: 10,
			filename: 'test.png',
			user_id: 11,
			object: 'technologies',
			object_id: 5,
			created_at: '2020-08-30 19:03:05',
			updated_at: '2020-08-30 19:03:05',
			url: 'http://127.0.0.1:3333/uploads/technologies/test.png',
		},
		{
			id: 11,
			filename: 'localhost.png',
			user_id: 11,
			object: 'technologies',
			object_id: 5,
			created_at: '2020-08-30 19:03:09',
			updated_at: '2020-08-30 19:03:09',
			url: 'http://127.0.0.1:3333/uploads/technologies/localhost.png',
		},
		{
			id: 12,
			filename: '123.pdf',
			user_id: 11,
			object: 'technologies',
			object_id: 5,
			created_at: '2020-08-30 19:03:14',
			updated_at: '2020-08-30 19:03:14',
			url: 'http://127.0.0.1:3333/uploads/technologies/123.pdf',
		},
		{
			id: 13,
			filename: 'resume.pdf',
			user_id: 11,
			object: 'technologies',
			object_id: 5,
			created_at: '2020-08-30 19:03:15',
			updated_at: '2020-08-30 19:03:15',
			url: 'http://127.0.0.1:3333/uploads/technologies/resume.pdf',
		},
	],
	normalized: {
		images: [
			{
				id: 10,
				filename: 'test.png',
				user_id: 11,
				object: 'technologies',
				object_id: 5,
				created_at: '2020-08-30 19:03:05',
				updated_at: '2020-08-30 19:03:05',
				url: 'http://127.0.0.1:3333/uploads/technologies/test.png',
			},
			{
				id: 11,
				filename: 'localhost.png',
				user_id: 11,
				object: 'technologies',
				object_id: 5,
				created_at: '2020-08-30 19:03:09',
				updated_at: '2020-08-30 19:03:09',
				url: 'http://127.0.0.1:3333/uploads/technologies/localhost.png',
			},
		],
		documents: [
			{
				id: 12,
				filename: '123.pdf',
				user_id: 11,
				object: 'technologies',
				object_id: 5,
				created_at: '2020-08-30 19:03:14',
				updated_at: '2020-08-30 19:03:14',
				url: 'http://127.0.0.1:3333/uploads/technologies/123.pdf',
			},
			{
				id: 13,
				filename: 'resume.pdf',
				user_id: 11,
				object: 'technologies',
				object_id: 5,
				created_at: '2020-08-30 19:03:15',
				updated_at: '2020-08-30 19:03:15',
				url: 'http://127.0.0.1:3333/uploads/technologies/resume.pdf',
			},
		],
	},
};

describe('createTechnology', () => {
	beforeAll(() => {
		fetchMock.mockReset();

		fetchMock.post(technologyEndpoint, (url, options) => {
			let response = {};

			const body = JSON.parse(options.body);

			if (!body.title || !body.description) {
				return {
					status: 400,
					body: {},
				};
			}

			response = {
				...body,
				id: 1,
				status: 'draft',
				terms: prepareTerms(termsFormData),
			};

			return {
				status: 200,
				body: response,
			};
		});
	});

	test('it creates a technology successfully', async () => {
		const technology = await createTechnology({ ...technologyData, terms: termsFormData });

		expect(technology).toEqual({
			...technologyData,
			id: 1,
			status: 'draft',
			terms: prepareTerms(termsFormData),
		});
		expect(fetchMock).toHaveFetched(technologyEndpoint, {
			method: 'POST',
		});
	});

	test('it does not create a technology if there are missing fields', async () => {
		const technology = await createTechnology({ title: '' });

		expect(technology).toBeFalsy();
		expect(fetchMock).toHaveFetched(technologyEndpoint, 'POST');
	});

	test('it returns false if response is not 200', async () => {
		fetchMock.mockReset();
		fetchMock.post(technologyEndpoint, { status: 400 });
		const technology = await createTechnology({ title: '' });

		expect(technology).toBeFalsy();
		expect(fetchMock).toHaveFetched(technologyEndpoint, 'POST');
	});
});

describe('updateTechnology', () => {
	const updateTechnologyEndpoint = /technologies\/(.*)/;
	beforeAll(() => {
		fetchMock.mockReset();

		fetchMock.put(updateTechnologyEndpoint, {
			status: 200,
			body: {
				...technologyData,
				id: 1,
				status: 'draft',
			},
		});
	});

	test('it updates a technology successfuly', async () => {
		const technology = await updateTechnology(
			10,
			{ ...technologyData, terms: termsFormData },
			{
				normalize: false,
			},
		);

		// expect response to not come back normalized.
		expect(technology).toEqual({
			...technologyData,
			id: 1,
			status: 'draft',
		});

		// the payload should be sent "prepared"
		expect(fetchMock).toHaveFetched(updateTechnologyEndpoint, {
			method: 'PUT',
			body: {
				...technologyData,
				terms: prepareTerms(termsFormData),
			},
		});
	});

	test('it updates a technology and normalizes the response successfully', async () => {
		const technology = await updateTechnology(
			10,
			{ ...technologyData, terms: termsFormData },
			{
				normalize: true,
			},
		);

		// the response should come back normalized.
		expect(technology).toEqual({
			...technologyData,
			id: 1,
			status: 'draft',
			terms: normalizeTerms(technologyData.terms),
		});

		// the payload should be sent "prepared"
		expect(fetchMock).toHaveFetched(updateTechnologyEndpoint, {
			method: 'PUT',
			body: {
				...technologyData,
				terms: prepareTerms(termsFormData),
			},
		});
	});

	test('it returns false if no id is provided', async () => {
		const technology = await updateTechnology();

		expect(technology).toBeFalsy();
	});

	test('it returns false if response is not 200', async () => {
		fetchMock.mockReset();
		fetchMock.put(updateTechnologyEndpoint, { status: 400 });
		const technology = await updateTechnology(10, { title: '' });

		expect(technology).toBeFalsy();
		expect(fetchMock).toHaveFetched(updateTechnologyEndpoint, {
			method: 'PUT',
			status: 400,
		});
	});
});

describe('getTechnologies', () => {
	const getTechnologiesEndpoint = /technologies/;
	beforeEach(() => {
		fetchMock.mockReset();
	});

	test('it fetches technologies data successfully', async () => {
		fetchMock.get(getTechnologiesEndpoint, technologyData);
		const technologies = await getTechnologies();

		expect(technologies).toEqual(technologyData);
		expect(fetchMock).toHaveFetched(getTechnologiesEndpoint, {
			method: 'GET',
		});
	});

	test('it returns false if request fails', async () => {
		fetchMock.get(getTechnologiesEndpoint, { status: 400 });
		const technologies = await getTechnologies();

		expect(technologies).toBeFalsy();
		expect(fetchMock).toHaveFetched(getTechnologiesEndpoint, {
			method: 'GET',
		});
	});
});

describe('getTechnology', () => {
	const getTechnologyEndpoint = /technologies\/(.*)/;
	const getTechnologyCostEndpoint = /technologies\/(.*)\/costs/;
	const getTechnologyTermsEndpoint = `${baseUrl}/technologies/1/terms?embed`;

	beforeEach(() => {
		fetchMock.mockReset();
	});

	test('it fetches technology data successfully', async () => {
		fetchMock.get(getTechnologyEndpoint, technologyData);
		const technology = await getTechnology(1, { normalize: false });

		expect(technology).toEqual(technologyData);
		expect(fetchMock).toHaveFetched(getTechnologyEndpoint, {
			method: 'GET',
			body: technologyData,
		});
	});

	test('it fetches technology data and normalizes it successfully', async () => {
		fetchMock.get(getTechnologyEndpoint, technologyData);
		const technology = await getTechnology(1, { normalize: true });

		// response should come back normalized
		expect(technology).toEqual({
			...technologyData,
			terms: normalizeTerms(technologyData.terms),
		});

		expect(fetchMock).toHaveFetched(getTechnologyEndpoint, {
			method: 'GET',
			body: technologyData,
		});
	});

	test('it fetches technology and normalize taxonomies successfully', async () => {
		fetchMock.get(getTechnologyEndpoint, { terms: termsData });
		const technology = await getTechnology(1, { normalizeTaxonomies: true });

		const normalizedTaxonomies = normalizeTaxonomies(termsData);

		expect(normalizedTaxonomies).toEqual(taxonomiesData);

		expect(technology).toEqual({
			terms: termsData,
			taxonomies: normalizedTaxonomies,
		});

		expect(fetchMock).toHaveFetched(getTechnologyEndpoint, {
			method: 'GET',
			body: { terms: termsData },
		});
	});

	test('it returns null when technology does not have terms for taxonomies normalizing', async () => {
		const emptyTerms = [];

		fetchMock.get(getTechnologyEndpoint, { terms: emptyTerms });
		const technology = await getTechnology(1, { normalizeTaxonomies: true });

		expect(technology).toEqual({
			terms: emptyTerms,
			taxonomies: normalizeTaxonomies(emptyTerms),
		});

		expect(fetchMock).toHaveFetched(getTechnologyEndpoint, {
			method: 'GET',
			body: { terms: emptyTerms },
		});
	});

	test('it returns false if request fails', async () => {
		fetchMock.get(getTechnologyEndpoint, { status: 400 });
		const technology = await getTechnology(1);

		expect(technology).toBeFalsy();
		expect(fetchMock).toHaveFetched(getTechnologyEndpoint, {
			method: 'GET',
			status: 400,
		});
	});

	test('it fetches technologies costs successfullly', async () => {
		fetchMock.get(getTechnologyCostEndpoint, costsData);
		const costs = await getTechnologyCosts(1, { normalize: false });

		expect(costs).toEqual(costsData);
		expect(fetchMock).toHaveFetched(getTechnologyCostEndpoint, {
			method: 'GET',
			body: costsData,
		});
	});

	test('it fetches technologies costs and normalizes it successfullly', async () => {
		fetchMock.get(getTechnologyCostEndpoint, costsData);
		const costs = await getTechnologyCosts(1, { normalize: true });

		expect(costs).toEqual({
			...costsData,
			costs: normalizeCosts(costsData.costs),
		});
		expect(fetchMock).toHaveFetched(getTechnologyCostEndpoint, {
			method: 'GET',
			body: costsData,
		});
	});

	test('it returns false if request fail', async () => {
		fetchMock.get(getTechnologyCostEndpoint, { status: 400 });
		const costs = await getTechnologyCosts(1);

		expect(costs).toBeFalsy();

		expect(fetchMock).toHaveFetched(getTechnologyCostEndpoint, {
			method: 'GET',
			body: costsData,
		});
	});

	test('it fetches technologies terms successfullly', async () => {
		fetchMock.get(getTechnologyTermsEndpoint, termsData);
		const costs = await getTechnologyTerms(1, { normalize: false });

		expect(costs).toEqual(termsData);
		expect(fetchMock).toHaveFetched(getTechnologyTermsEndpoint, {
			method: 'GET',
			body: termsData,
		});
	});

	test('it returns false if response is not 200', async () => {
		fetchMock.get(getTechnologyTermsEndpoint, { status: 400 });
		const costs = await getTechnologyTerms(1);

		expect(costs).toBeFalsy();

		expect(fetchMock).toHaveFetched(getTechnologyTermsEndpoint, {
			method: 'GET',
		});
	});
});

describe('updateTechnologyCosts', () => {
	const technologyCostEndpoint = /technologies\/(.*)\/costs/;

	beforeEach(() => {
		fetchMock.mockReset();
	});

	test('it returns false if id is invalid', async () => {
		fetchMock.put(technologyCostEndpoint, {});
		const response = await updateTechnologyCosts(false, {});

		expect(response).toBeFalsy();
	});

	test('it calls the proper endpoint if id is valid', async () => {
		fetchMock.put(technologyCostEndpoint, {});
		const response = await updateTechnologyCosts(3, {});

		expect(response).not.toBeFalsy();
		expect(fetchMock).toHaveFetched(technologyCostEndpoint, {
			method: 'PUT',
		});
	});

	test('it updates technologies costs and returns normalized costs', async () => {
		fetchMock.put(technologyCostEndpoint, costsData);
		// we normalize costs here to send it the way the form sends
		const dataPosted = { ...costsData, costs: normalizeCosts(costsData.costs) };
		const costs = await updateTechnologyCosts(1, dataPosted, { normalize: true });

		expect(costs).toEqual({
			...costsData,
			costs: normalizeCosts(costsData.costs),
		});

		expect(fetchMock).toHaveFetched(technologyCostEndpoint, {
			method: 'PUT',
		});
	});

	test('it returns false if request fail', async () => {
		fetchMock.put(technologyCostEndpoint, { status: 400 });
		const response = await updateTechnologyCosts(3, {});

		expect(response).toBeFalsy();
		expect(fetchMock).toHaveFetched(technologyCostEndpoint, {
			method: 'PUT',
		});
	});
});

describe('updateTechnologyResponsibles', () => {
	const updateTechnologyResponsiblesEndpoint = /technologies\/(.*)\/users/;

	beforeEach(() => {
		fetchMock.mockReset();
	});

	test('it returns false if id is not provided', async () => {
		fetchMock.post(updateTechnologyResponsiblesEndpoint, {});
		const response = await updateTechnologyResponsibles();
		expect(response).toBeFalsy();
	});

	test('it calls the proper endpoint if id is valid', async () => {
		fetchMock.post(updateTechnologyResponsiblesEndpoint, {});
		const response = await updateTechnologyResponsibles(1, {});

		expect(response).not.toBeFalsy();
		expect(fetchMock).toHaveFetched(updateTechnologyResponsiblesEndpoint, {
			method: 'POST',
		});
	});

	test('it returns false if request fail', async () => {
		fetchMock.post(updateTechnologyResponsiblesEndpoint, { status: 400 });
		const response = await updateTechnologyResponsibles(1, {});

		expect(response).toBeFalsy();
		expect(fetchMock).toHaveFetched(updateTechnologyResponsiblesEndpoint, {
			method: 'POST',
		});
	});
});

describe('getAttachments', () => {
	const technologyId = 1;
	const endpoint = `${baseUrl}/uploads?object=technologies&object_id=${technologyId}`;

	beforeEach(() => {
		fetchMock.mockClear();
		fetchMock.mockReset();
	});

	test('it fetches technology attachments successfully', async () => {
		fetchMock.get(endpoint, attachmentsData.raw);

		const attachments = await getAttachments(technologyId);

		expect(attachments).toEqual(attachmentsData.raw);
		expect(fetchMock).toHaveFetched(endpoint, {
			method: 'GET',
			body: attachmentsData.raw,
		});
	});

	test('it fetches technology attachments and normalizes it successfully', async () => {
		fetchMock.get(endpoint, attachmentsData.raw);

		const attachments = await getAttachments(technologyId, { normalize: true });

		expect(attachments).toEqual(normalizeAttachments(attachmentsData.raw));

		expect(fetchMock).toHaveFetched(endpoint, {
			method: 'GET',
			body: attachmentsData.raw,
		});
	});

	test('it returns an empty array if request fails', async () => {
		fetchMock.get(endpoint, { status: 400 });
		const attachments = await getAttachments(technologyId);
		expect(attachments).toEqual([]);
	});

	test('it returns an empty array if no id is provided', async () => {
		const attachments = await getAttachments();
		expect(attachments).toEqual([]);
	});
});

describe('getReviews', () => {
	const technologyId = 1;
	const endpoint = `${baseUrl}/technologies/${technologyId}/reviews?orderBy=created_at&order=DESC`;

	beforeEach(() => {
		fetchMock.mockClear();
		fetchMock.mockReset();
	});

	test('it fetches technology reviews successfully', async () => {
		fetchMock.get(endpoint, reviewsData);

		const attachments = await getReviews(technologyId);

		expect(attachments).toEqual(reviewsData);
		expect(fetchMock).toHaveFetched(endpoint, {
			method: 'GET',
			body: reviewsData,
		});
	});

	test('it returns an empty array if request fails', async () => {
		fetchMock.get(endpoint, { status: 400 });
		const attachments = await getReviews(technologyId);
		expect(attachments).toEqual([]);
	});

	test('it returns an empty array if no id is provided', async () => {
		const attachments = await getReviews();
		expect(attachments).toEqual([]);
	});
});
