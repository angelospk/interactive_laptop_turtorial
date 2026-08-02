<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		value = $bindable(),
		open = $bindable(false),
		...restProps
	}: SelectPrimitive.RootProps = $props();

	// RootProps is a union (type="single" → string, type="multiple" → string[]),
	// so a plain `bind:value` does not typecheck here. The getter/setter box
	// forwards the binding while deferring the discrimination to the caller.
	const valueBinding = {
		get current(): never {
			return value as never;
		},
		set current(next: never) {
			value = next;
		},
	};
</script>

<SelectPrimitive.Root bind:value={valueBinding.current} bind:open {...restProps} />
