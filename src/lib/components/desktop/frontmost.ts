/**
 * The window in front: windows are kept in stacking order (bringing one
 * forward moves it to the end), and a minimised window is not on screen.
 */
export function frontmostWindowId(
	windows: readonly { id: string; minimized: boolean }[]
): string | undefined {
	return windows.findLast((w) => !w.minimized)?.id;
}
