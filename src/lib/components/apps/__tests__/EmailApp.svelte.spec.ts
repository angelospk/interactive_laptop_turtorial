import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EmailApp from '$lib/components/apps/EmailApp.svelte';

describe('EmailApp Component', () => {
	it('should render email list', async () => {
		const emails = [
            {
                id: '1',
                sender: 'Test Sender',
                subject: 'Test Subject',
                body: 'Test Body',
                date: 'Now',
                isRead: false,
                folder: 'inbox'
            }
        ];
        const onAction = vi.fn();

		render(EmailApp, { emails, onAction });

		await expect.element(page.getByText('Test Subject')).toBeInTheDocument();
        await expect.element(page.getByText('Test Sender')).toBeInTheDocument();
	});

    it('should select an email and mark as read', async () => {
        const emails = [
            {
                id: '1',
                sender: 'Test Sender',
                subject: 'Test Subject',
                body: 'Test Body',
                date: 'Now',
                isRead: false,
                folder: 'inbox'
            }
        ];
        const onAction = vi.fn();

		render(EmailApp, { emails, onAction });

        const emailItem = page.getByText('Test Subject');
        await emailItem.click();

        // Check if onAction was called with read-email
        expect(onAction).toHaveBeenCalledWith('read-email', { id: '1' });

        // Check if content is displayed
        await expect.element(page.getByRole('heading', { name: 'Test Subject' })).toBeInTheDocument();
    });

    it('should delete an email', async () => {
        const emails = [
            {
                id: '1',
                sender: 'Test Sender',
                subject: 'Test Subject',
                body: 'Test Body',
                date: 'Now',
                isRead: true,
                folder: 'inbox'
            }
        ];
        const onAction = vi.fn();

		render(EmailApp, { emails, onAction });

        // Select email
        await page.getByText('Test Subject').click();

        // Click delete button
        const deleteBtn = page.getByRole('button', { name: 'Διαγραφή' });
        await deleteBtn.click();

        expect(onAction).toHaveBeenCalledWith('delete-email', { id: '1' });
    });

     it('should navigate folders and emit view-folder', async () => {
        const onAction = vi.fn();
		render(EmailApp, { emails: [], onAction });

        const sentBtn = page.getByText('Απεσταλμένα');
        await sentBtn.click();

        expect(onAction).toHaveBeenCalledWith('view-folder', { folder: 'sent' });
    });

    it('should save draft and emit save-draft', async () => {
        const onAction = vi.fn();
		render(EmailApp, { emails: [], onAction });

        // Click Compose
        await page.getByText('Σύνταξη').click();

        // Fill subject
        const subjectInput = page.getByPlaceholder('Θέμα');
        await subjectInput.fill('Draft Subject');

        // Click Save
        await page.getByText('Αποθήκευση').click();

        expect(onAction).toHaveBeenCalledWith('save-draft', { subject: 'Draft Subject' });
    });

    it('should send email and emit send-email', async () => {
        const onAction = vi.fn();
		render(EmailApp, { emails: [], onAction });

        // Click Compose
        await page.getByText('Σύνταξη').click();

        // Fill details
        await page.getByPlaceholder('Προς').fill('test@example.com');
        await page.getByPlaceholder('Θέμα').fill('Test Send');

        // Click Send
        await page.getByRole('button', { name: 'Αποστολή' }).click();

        expect(onAction).toHaveBeenCalledWith('send-email', { to: 'test@example.com', subject: 'Test Send' });
    });

    it('should restore email from trash', async () => {
         const emails = [
            {
                id: '1',
                sender: 'Test Sender',
                subject: 'Deleted Email',
                body: 'Body',
                date: 'Now',
                isRead: true,
                folder: 'trash'
            }
        ];
        const onAction = vi.fn();

		render(EmailApp, { emails, onAction });

        // Go to Trash folder first
        await page.getByText('Κάδος').click();

        // Select email
        await page.getByText('Deleted Email').click();

        // Click Restore button
        const restoreBtn = page.getByRole('button', { name: 'Επαναφορά' });
        await restoreBtn.click();

        expect(onAction).toHaveBeenCalledWith('restore-email', { id: '1' });
    });
});
