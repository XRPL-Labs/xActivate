import type { Plugin, ResolvedConfig } from 'vite';
import pc from 'picocolors';
import { parseURL } from 'ufo';

export function terminalPlugin(): Plugin {
    let config: ResolvedConfig;
    return {
        name: 'terminal',
        configResolved(_config) {
            config = _config;
        },
        configureServer(server) {
            server.middlewares.use('/__log', (req: any, res) => {
                const { pathname, search } = parseURL(req?.url);
                console.log(pc.white(`  » ${decodeURI(search.slice(1))}`));
                res.end();
            });
        },
    };
}