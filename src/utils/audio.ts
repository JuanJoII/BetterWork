export function playCompletionChime() {
	try {
		const AudioCtxClass =
			window.AudioContext ||
			/* biome-ignore lint/suspicious/noExplicitAny: webkitAudioContext fallback */
			(window as any).webkitAudioContext;
		const ctx = new AudioCtxClass();

		// Warm dual bell chime
		const osc1 = ctx.createOscillator();
		const osc2 = ctx.createOscillator();
		const gainNode = ctx.createGain();

		osc1.type = "sine";
		osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5

		osc2.type = "sine";
		osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6

		gainNode.gain.setValueAtTime(0, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
		gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

		osc1.connect(gainNode);
		osc2.connect(gainNode);
		gainNode.connect(ctx.destination);

		osc1.start();
		osc2.start();
		osc1.stop(ctx.currentTime + 2.0);
		osc2.stop(ctx.currentTime + 2.0);
	} catch (e) {
		console.error("AudioContext chime blocked or failed", e);
	}
}
