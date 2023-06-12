import { spawn } from "child_process";

/**
 * Manages the child process of the API server
 */
class ChildProcessManager {
	constructor() {
		this.child = null;
	}

	getChildProcess() {
		return this.child;
	}

	spawnChildProcess() {
		// Spawn the child process
		const child = spawn("node", ["childServer.js"], {
			detached: false,
			stdio: "pipe",
		});
		this.listenChildProcessOutput(child);
		this.child = child;

		// Detect child process exit and spawn a new child process
		child.on("exit", (code, signal) => {
			this.spawnChildProcess();
		});
	}

	listenChildProcessOutput(child) {
		if (!child) return;

		// Listen to the child process output
		child.stdout.on("data", (data) => {
			// Output received from child process
			console.log(data.toString().trimEnd());
		});

		child.stderr.on("data", (data) => {
			// Error output received from child process
			console.error(data.toString().trimEnd());
		});
	}

	restartChildProcess() {
		if (!this.child) return;

		this.child.kill("SIGINT");
	}
}

export const processManager = new ChildProcessManager();
