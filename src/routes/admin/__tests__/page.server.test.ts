import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server';
import { db } from '$lib/db/client';

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
    }
}));

describe('Admin Page Load', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw 403 if not admin', async () => {
        const locals = { admin: false } as any;
        await expect(load({ locals } as any)).rejects.toThrow('Unauthorized');
    });

    it('should return grouped lessons if admin', async () => {
        const locals = { admin: true } as any;
        const result = await load({ locals } as any);

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
