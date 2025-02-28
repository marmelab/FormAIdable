import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    extensionApi: 'chrome',
    modules: ['@wxt-dev/module-react'],
    manifest: {
        permissions: ['storage', 'tabs', 'scripting'],
        host_permissions: ['<all_urls>'],
    },
});
