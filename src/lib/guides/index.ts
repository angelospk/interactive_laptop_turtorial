import type { GuideDefinition } from './types';
import { module5Guide } from './module5';

/** guideId (the guide lesson's `config.guideId`) → definition. */
export const guides: Record<string, GuideDefinition> = {
	[module5Guide.id]: module5Guide
};

export * from './types';
