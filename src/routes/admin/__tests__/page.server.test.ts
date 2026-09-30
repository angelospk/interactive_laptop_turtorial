import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server';

// Mock DB
vi.mock('$lib/db/client', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockResolvedValue([
			{ id: 'l1', moduleId: 'm1', orderIndex: 0, enabled: true },
			{ id: 'l2', moduleId: 'm1', orderIndex: 1, enabled: false },
			{ id: 'l3', moduleId: 'm2', orderIndex: 0, enabled: true }
		])
	},
	lessons: {
		moduleId: 'moduleId',
		orderIndex: 'orderIndex'
	}
}));

vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		throw new Error(`${status}: ${message}`);
	},
	// The load now guards via requireAdminPage(), which redirects rather than
	// erroring — a non-admin should land on the login form, not a dead end.
	redirect: (status: number, location: string) => {
		throw Object.assign(new Error(`${status}: ${location}`), { status, location });
	}
}));

const event = (locals: Partial<App.Locals>) =>
	({ locals }) as unknown as Parameters<typeof load>[0];

describe('Admin Page Load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should redirect to the admin login if not admin', async () => {
		await expect(load(event({ admin: false }))).rejects.toMatchObject({
			status: 302,
			location: '/admin/login'
		});
	});

	it('should return grouped lessons if admin', async () => {
		const result = (await load(event({ admin: true }))) as import('../$types').PageData;

		expect(result.totalLessons).toBe(3);
		expect(result.enabledCount).toBe(2);
		expect(result.lessonsByModule).toEqual({
			m1: [
				{ id: 'l1', moduleId: 'm1', orderIndex: 0, enabled: true },
				{ id: 'l2', moduleId: 'm1', orderIndex: 1, enabled: false }
			],
			m2: [{ id: 'l3', moduleId: 'm2', orderIndex: 0, enabled: true }]
		});
	});
});
