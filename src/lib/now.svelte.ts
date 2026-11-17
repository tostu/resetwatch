/** Shared ticking clock. `clock.now` updates every second on the client. */
class Clock {
	now = $state(Date.now());
	#timer: ReturnType<typeof setInterval> | undefined;
	#users = 0;

	/** Call from a component; returns cleanup. Use inside $effect. */
	start(): () => void {
		this.#users++;
		this.now = Date.now();
		if (!this.#timer) {
			this.#timer = setInterval(() => (this.now = Date.now()), 1000);
		}
		return () => {
			this.#users--;
			if (this.#users <= 0 && this.#timer) {
				clearInterval(this.#timer);
				this.#timer = undefined;
				this.#users = 0;
			}
		};
	}
}

export const clock = new Clock();
