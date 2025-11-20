import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    // Inherit data from layout (includes user and progress)
    const layoutData = await parent();
    return layoutData;
};
