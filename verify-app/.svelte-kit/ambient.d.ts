
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const LESSCLOSE: string;
	export const GPG_AGENT_INFO: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const SYSTEMD_EXEC_PID: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const XAUTHORITY: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const DEBUGINFOD_URLS: string;
	export const LOGNAME: string;
	export const QT_IM_MODULE: string;
	export const DESKTOP_SESSION: string;
	export const NVM_BIN: string;
	export const TERM_PROGRAM: string;
	export const XDG_MENU_PREFIX: string;
	export const CHROME_DESKTOP: string;
	export const CONDA_SHLVL: string;
	export const MANAGERPID: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const MANDATORY_PATH: string;
	export const NVM_INC: string;
	export const GDMSESSION: string;
	export const CONDA_EXE: string;
	export const XDG_SESSION_TYPE: string;
	export const LESSOPEN: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const USER: string;
	export const USERNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const TRIGGER_PATH: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_config_user_agent: string;
	export const DEFAULTS_PATH: string;
	export const SSH_AUTH_SOCK: string;
	export const DISPLAY: string;
	export const DENO_DIR: string;
	export const PATH: string;
	export const TERM: string;
	export const XDG_SESSION_CLASS: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const GIT_ASKPASS: string;
	export const INIT_CWD: string;
	export const LANG: string;
	export const QT_ACCESSIBILITY: string;
	export const IM_CONFIG_PHASE: string;
	export const WINDOWPATH: string;
	export const XDG_DATA_DIRS: string;
	export const SESSION_MANAGER: string;
	export const _: string;
	export const TERM_PROGRAM_VERSION: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const CONDA_PYTHON_EXE: string;
	export const SHELL: string;
	export const TRIGGER_UNIT: string;
	export const HOME: string;
	export const NODE_ENV: string;
	export const GDK_BACKEND: string;
	export const INVOCATION_ID: string;
	export const XMODIFIERS: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const DENO_INSTALL: string;
	export const PWD: string;
	export const NVM_DIR: string;
	export const QTWEBENGINE_DICTIONARIES_PATH: string;
	export const XDG_CONFIG_DIRS: string;
	export const SHLVL: string;
	export const OLDPWD: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const GTK_MODULES: string;
	export const COLORTERM: string;
	export const GSM_SKIP_SSH_AGENT_WORKAROUND: string;
	export const JOURNAL_STREAM: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		LESSCLOSE: string;
		GPG_AGENT_INFO: string;
		GNOME_SHELL_SESSION_MODE: string;
		SYSTEMD_EXEC_PID: string;
		VSCODE_GIT_IPC_HANDLE: string;
		XAUTHORITY: string;
		MEMORY_PRESSURE_WATCH: string;
		DEBUGINFOD_URLS: string;
		LOGNAME: string;
		QT_IM_MODULE: string;
		DESKTOP_SESSION: string;
		NVM_BIN: string;
		TERM_PROGRAM: string;
		XDG_MENU_PREFIX: string;
		CHROME_DESKTOP: string;
		CONDA_SHLVL: string;
		MANAGERPID: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		MANDATORY_PATH: string;
		NVM_INC: string;
		GDMSESSION: string;
		CONDA_EXE: string;
		XDG_SESSION_TYPE: string;
		LESSOPEN: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		USER: string;
		USERNAME: string;
		XDG_SESSION_DESKTOP: string;
		TRIGGER_PATH: string;
		XDG_RUNTIME_DIR: string;
		npm_config_user_agent: string;
		DEFAULTS_PATH: string;
		SSH_AUTH_SOCK: string;
		DISPLAY: string;
		DENO_DIR: string;
		PATH: string;
		TERM: string;
		XDG_SESSION_CLASS: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		GIT_ASKPASS: string;
		INIT_CWD: string;
		LANG: string;
		QT_ACCESSIBILITY: string;
		IM_CONFIG_PHASE: string;
		WINDOWPATH: string;
		XDG_DATA_DIRS: string;
		SESSION_MANAGER: string;
		_: string;
		TERM_PROGRAM_VERSION: string;
		MEMORY_PRESSURE_WRITE: string;
		CONDA_PYTHON_EXE: string;
		SHELL: string;
		TRIGGER_UNIT: string;
		HOME: string;
		NODE_ENV: string;
		GDK_BACKEND: string;
		INVOCATION_ID: string;
		XMODIFIERS: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		DENO_INSTALL: string;
		PWD: string;
		NVM_DIR: string;
		QTWEBENGINE_DICTIONARIES_PATH: string;
		XDG_CONFIG_DIRS: string;
		SHLVL: string;
		OLDPWD: string;
		GNOME_DESKTOP_SESSION_ID: string;
		GTK_MODULES: string;
		COLORTERM: string;
		GSM_SKIP_SSH_AGENT_WORKAROUND: string;
		JOURNAL_STREAM: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
