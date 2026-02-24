import {
    intro,
    outro,
    text,
    spinner,
    note,
    group
} from '@clack/prompts';
import pc from 'picocolors';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

function parseEnv(path: string): Record<string, string> {
    if (!existsSync(path)) return {};
    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n');
    const config: Record<string, string> = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            config[key.trim()] = valueParts.join('=').trim();
        }
    }
    return config;
}

async function main() {
    intro(pc.bgCyan(pc.black(' LoveFinder Setup ')));

    const s = spinner();
    const existingEnv = parseEnv('.env');

    const getLocalIp = () => {
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]!) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
        return '127.0.0.1';
    };

    const localIp = getLocalIp();

    const config = await group(
        {
            dbUser: () =>
                text({
                    message: 'Database username:',
                    placeholder: existingEnv.POSTGRES_USER || 'app',
                    initialValue: existingEnv.POSTGRES_USER || 'app',
                }),
            dbPassword: () =>
                text({
                    message: 'Database password:',
                    placeholder: existingEnv.POSTGRES_PASSWORD || 'leave blank for none',
                    initialValue: existingEnv.POSTGRES_PASSWORD || 'app_password',
                }),
            dbName: () =>
                text({
                    message: 'Database name:',
                    placeholder: existingEnv.POSTGRES_DB || 'app',
                    initialValue: existingEnv.POSTGRES_DB || 'app',
                }),
            dbPort: () =>
                text({
                    message: 'Database port (outer):',
                    placeholder: existingEnv.DB_PORT || '5430',
                    initialValue: existingEnv.DB_PORT || '5430',
                }),
            backendPort: () =>
                text({
                    message: 'Backend port (internal):',
                    placeholder: existingEnv.BACKEND_PORT || '3000',
                    initialValue: existingEnv.BACKEND_PORT || '3000',
                }),
            backendUrl: () =>
                text({
                    message: 'Public Backend URL (for mobile access):',
                    placeholder: existingEnv.BACKEND_URL || `http://${localIp}:3000`,
                    initialValue: existingEnv.BACKEND_URL || `http://${localIp}:3000`,
                }),
        },
        {
            onCancel: () => {
                outro(pc.red('Setup cancelled.'));
                process.exit(0);
            },
        }
    );

    s.start('Generating environment files...');

    const sessionSecret = existingEnv.SESSION_SECRET || randomBytes(32).toString('hex');
    const databaseUrl = `postgres://${config.dbUser}:${config.dbPassword}@localhost:${config.dbPort}/${config.dbName}`;

    const envContent = `
POSTGRES_USER=${config.dbUser}
POSTGRES_PASSWORD=${config.dbPassword}
POSTGRES_DB=${config.dbName}
DB_PORT=${config.dbPort}
BACKEND_PORT=${config.backendPort}
DATABASE_URL=${databaseUrl}
REDIS_URL=redis://localhost:6379
SESSION_SECRET=${sessionSecret}
BACKEND_URL=${config.backendUrl}
`.trim();

    const mobileEnvContent = `
EXPO_PUBLIC_API_URL=${config.backendUrl}/api/v1
EXPO_PUBLIC_SOCKET_URL=${config.backendUrl}
`.trim();

    writeFileSync('.env', envContent);
    writeFileSync(join('apps', 'mobile', '.env'), mobileEnvContent);
    writeFileSync(join('apps', 'backend', '.env'), envContent);

    s.stop('Environment files generated!');

    note(
        `Root .env, apps/backend/.env, and apps/mobile/.env have been updated.
Local IP detected: ${pc.green(localIp)}
Backend URL (External): ${pc.green(config.backendUrl)}
Backend URL (Internal): ${pc.green(`http://localhost:${config.backendPort}`)}`,
        'Configuration Summary'
    );

    outro(pc.cyan("You're all set! Run 'bun run setup' next."));
}

main().catch(console.error);
