<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	let { form } = $props();
	let loading = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
			loading = false;
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle class="text-2xl">Admin Login</CardTitle>
			<CardDescription>Enter the admin password to continue</CardDescription>
		</CardHeader>
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input type="password" id="password" name="password" required placeholder="••••••••" />
				</div>
			</CardContent>
			<CardFooter>
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</Button>
			</CardFooter>
		</form>
	</Card>
</div>
