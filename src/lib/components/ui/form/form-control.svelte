<script lang="ts">
	import * as FormPrimitive from "formsnap";

	let { ...restProps }: FormPrimitive.ControlProps = $props();
</script>

<FormPrimitive.Control {...restProps} />
