import type { GuideDefinition } from './types';
import { module1Guide } from './module1';
import { module2Guide } from './module2';
import { module3Guide } from './module3';
import { module4Guide } from './module4';
import { module6Guide } from './module6';
import { wordGuide } from './word';
import { module5Guide } from './module5';

/** guideId (the guide lesson's `config.guideId`) → definition. */
export const guides: Record<string, GuideDefinition> = {
	[module1Guide.id]: module1Guide,
	[module2Guide.id]: module2Guide,
	[module3Guide.id]: module3Guide,
	[module4Guide.id]: module4Guide,
	[module6Guide.id]: module6Guide,
	[wordGuide.id]: wordGuide,
	[module5Guide.id]: module5Guide
};

export * from './types';
export * from './target';
