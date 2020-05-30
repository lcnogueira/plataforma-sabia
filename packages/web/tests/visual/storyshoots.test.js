import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from '@storybook/addon-storyshots-puppeteer';

initStoryshots({
	suite: 'Visual Regression',
	framework: 'react',
	test: imageSnapshot({
		storybookUrl: 'http://localhost:9009',
		beforeScreenshot: () => new Promise((resolve) => setTimeout(() => resolve(), 500)),
		getScreenshotOptions: () => ({
			encoding: 'base64',
		}),
	}),
});
