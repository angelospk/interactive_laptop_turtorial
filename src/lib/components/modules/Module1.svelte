<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as ContextMenu from '$lib/components/ui/context-menu';

	// --- 1. Sniper Exercise (Hover) ---
	let bubbles = $state(
		Array(5)
			.fill(0)
			.map(() => ({
				id: crypto.randomUUID(),
				x: Math.random() * 90,
				y: Math.random() * 80,
				hovered: false
			}))
	);

	function handleBubbleHover(id: string) {
		const bubble = bubbles.find((b) => b.id === id);
		if (bubble && !bubble.hovered) {
			bubble.hovered = true;
			checkSniperCompletion();
		}
	}

	function checkSniperCompletion() {
		if (bubbles.every((b) => b.hovered)) {
			toast.success('Άσκηση 1: Τέλειος σκοπευτής!');
			gameState.updateProgress('module1', 15);
		}
	}

	// --- 2. Click Exercise ---
	let clickTargets = $state([true, true, true]);
	function handleClickTarget(index: number) {
		clickTargets[index] = false;
		if (clickTargets.every((t) => !t)) {
			toast.success('Άσκηση 2: Εξαφάνισες τα κουμπιά!');
			gameState.updateProgress('module1', 30);
		}
	}

	// --- 3. Double Click Exercise ---
	let folderOpen = $state(false);
	function handleDoubleClick() {
		if (!folderOpen) {
			folderOpen = true;
			toast.success('Άσκηση 3: Ο φάκελος άνοιξε!');
			gameState.updateProgress('module1', 45);
		}
	}

	// --- 4. Drag & Drop Puzzle ---
	let puzzlePieces = $state([
		{ id: 'square', color: 'bg-red-500', name: 'Τετράγωνο', dropped: false },
		{ id: 'circle', color: 'bg-blue-500', name: 'Κύκλος', dropped: false },
		{ id: 'triangle', color: 'bg-green-500', name: 'Τρίγωνο', dropped: false }
	]);
	let draggingItem: string | null = null;

	function handleDragStart(e: DragEvent, pieceId: string) {
		draggingItem = pieceId;
		e.dataTransfer?.setData('text/plain', pieceId);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		const droppedPieceId = draggingItem;
		draggingItem = null;

		if (droppedPieceId === targetId) {
			const piece = puzzlePieces.find((p) => p.id === droppedPieceId);
			if (piece) {
				piece.dropped = true;
				if (puzzlePieces.every((p) => p.dropped)) {
					toast.success('Άσκηση 4: Το παζλ ολοκληρώθηκε!');
					gameState.updateProgress('module1', 65);
				}
			}
		} else {
			toast.error('Λάθος σχήμα! Προσπάθησε ξανά.');
		}
	}

	// --- 5. Right Click Exercise ---
	function handleRightClick() {
		toast.success('Άσκηση 5: Βρήκες το κρυμμένο μενού!');
		gameState.updateProgress('module1', 80);
	}

	// --- 6. Scroll Exercise ---
	function handleScroll(e: Event) {
		const target = e.currentTarget as HTMLElement;
		// Check if scrolled to the bottom
		if (target.scrollHeight - target.scrollTop === target.clientHeight) {
			if (gameState.subscribe((s) => s.progress.module1 < 100)) {
				toast.success('Άσκηση 6: Έφτασες στο τέλος!');
				gameState.updateProgress('module1', 100);
			}
		}
	}
</script>

<div class="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
	<!-- 1. Sniper -->
	<Card>
		<CardHeader>
			<CardTitle>1. Ο Σκοπευτής (Hover)</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-slate-600">Πέρνα τον κέρσορα πάνω από τις φούσκες.</p>
			<div class="relative h-48 w-full rounded-md bg-slate-100">
				{#each bubbles as bubble}
					<div
						class="absolute h-8 w-8 rounded-full transition-colors"
						class:bg-blue-500={!bubble.hovered}
						class:bg-green-500={bubble.hovered}
						style="left: {bubble.x}%; top: {bubble.y}%"
						onmouseenter={() => handleBubbleHover(bubble.id)}
					></div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- 2. Click -->
	<Card>
		<CardHeader>
			<CardTitle>2. Το Μοναδικό Κλικ</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-slate-600">Κάνε κλικ για να εξαφανίσεις τα κουμπιά.</p>
			<div class="flex h-48 items-center justify-center gap-2">
				{#each clickTargets as target, i}
					{#if target}
						<Button onclick={() => handleClickTarget(i)}>Πάτησέ με</Button>
					{/if}
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- 3. Double Click -->
	<Card>
		<CardHeader>
			<CardTitle>3. Ο Διπλός Πράκτορας</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-slate-600">Κάνε διπλό κλικ για να ανοίξεις τον φάκελο.</p>
			<div
				class="flex h-48 items-center justify-center"
				ondblclick={handleDoubleClick}
				title="Κάνε διπλό κλικ εδώ"
			>
				<span class="text-6xl transition-transform" class:scale-110={folderOpen}>
					{folderOpen ? '📂' : '📁'}
				</span>
			</div>
		</CardContent>
	</Card>

	<!-- 4. Drag & Drop -->
	<Card class="lg:col-span-2">
		<CardHeader>
			<CardTitle>4. Το Παζλ (Drag & Drop)</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-slate-600">Σύρε κάθε σχήμα στη σωστή του θέση.</p>
			<div class="flex h-48 items-center justify-around">
				<!-- Pieces -->
				<div class="flex flex-col gap-4">
					{#each puzzlePieces as piece}
						{#if !piece.dropped}
							<div
								draggable="true"
								ondragstart={(e) => handleDragStart(e, piece.id)}
								class="h-16 w-16 {piece.color} flex cursor-grab items-center justify-center font-bold text-white"
								class:rounded-md={piece.id === 'square'}
								class:rounded-full={piece.id === 'circle'}
								style={piece.id === 'triangle'
									? 'width: 0; height: 0; background-color: transparent; border-left: 32px solid transparent; border-right: 32px solid transparent; border-bottom: 64px solid #10B981;'
									: ''}
							>
								{piece.id !== 'triangle' ? piece.name : ''}
							</div>
						{:else}
							<div class="h-16 w-16"></div>
						{/if}
					{/each}
				</div>
				<!-- Targets -->
				<div class="flex flex-col gap-4">
					{#each puzzlePieces as piece}
						<div
							ondragover={handleDragOver}
							ondrop={(e) => handleDrop(e, piece.id)}
							class="flex h-16 w-16 items-center justify-center border-2 border-dashed text-slate-400"
							class:rounded-md={piece.id === 'square'}
							class:rounded-full={piece.id === 'circle'}
							class:bg-green-100={piece.dropped}
						>
							{piece.dropped ? '✅' : piece.name}
						</div>
					{/each}
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 5. Right Click -->
	<Card>
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				<div
					class="flex h-full flex-col items-center justify-center rounded-lg bg-amber-100 p-4 text-center"
					oncontextmenu={(e) => {
						e.preventDefault();
						handleRightClick();
					}}
				>
					<span class="mb-2 text-4xl">🍎</span>
					<p class="font-bold">Κάνε δεξί κλικ στο μήλο!</p>
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item>Φάε με</ContextMenu.Item>
				<ContextMenu.Item>Ιδιότητες</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</Card>

	<!-- 6. Scroll -->
	<Card class="lg:col-span-3">
		<CardHeader>
			<CardTitle>6. Ο Τροχός (Scrolling)</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-slate-600">Χρησιμοποίησε τη ροδέλα για να βρεις τον κωδικό.</p>
			<div class="h-64 overflow-y-scroll rounded-md border bg-gray-100 p-4" onscroll={handleScroll}>
				<p>Συνέχισε να σκρολάρεις...</p>
				<div class="h-32"></div>
				<p>Ακόμα λίγο...</p>
				<div class="h-64"></div>
				<p>Έχεις δυνατά δάχτυλα!</p>
				<div class="h-96"></div>
				<p>Είσαι κοντά!</p>
				<div class="h-32"></div>
				<p class="text-center text-lg font-bold">Κωδικός: SVELTE-2025</p>
			</div>
		</CardContent>
	</Card>
</div>
