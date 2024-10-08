import { Client } from 'node-scp';

interface ScpWebpackPluginOptions { // extending options from node-scp options https://www.npmjs.com/package/node-scp
    host: string | undefined;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;
    dirs?: Array<{ from: string, to: string }>;
}

class ScpWebpackPlugin {

    constructor(private options: ScpWebpackPluginOptions) {
        // Validate options
    }

    apply(compiler: any) {
        if (!this.options.host) return;
        compiler.hooks.afterEmit.tapPromise('ScpWebpackPlugin', (compilation: any) => {
            return new Promise((resolve, reject) => {
                if (!this.options.host || !this.options.username) {
                    reject('Missing host or username');
                }
                if (!this.options.password && !this.options.privateKey) {
                    reject('Missing password or privateKey');
                }
                console.log('Uploading files to ' + this.options.host);
                Client(this.options).then(async (client) => {
                    if (this.options.dirs) {
                        for (const dir of this.options.dirs) {
                            await client.uploadDir(dir.from, dir.to);
                            console.log(dir.from + ' transferred to ' + dir.to);
                        }
                    }
                    client.close();
                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }
}

export default ScpWebpackPlugin;
