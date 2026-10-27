import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { pino } from "@walletconnect/logger";
import { SignClient } from "@walletconnect/sign-client";
import qrcode from "qrcode-terminal";
import { NAMESPACES, NETWORKS } from "./networks";

// Injected from package.json by build.mjs.
declare const __VERSION__: string;
const CONFIG_FILE = path.join(os.homedir(), ".wc-uri", "config.json");

// Same presets as the "Relayer Region" / "Origin Url" dropdowns of the web dapp.
const RELAYS: Record<string, string | undefined> = {
  default: undefined,
  us: "wss://us-east-1.relay.walletconnect.com",
  eu: "wss://eu-central-1.relay.walletconnect.com",
  ap: "wss://ap-southeast-1.relay.walletconnect.com",
};
const ORIGINS: Record<string, string> = {
  valid: "https://react-app.walletconnect.com",
  invalid: "https://invalid.origin",
  unknown: "unknown",
};

const HELP = `Generate a WalletConnect pairing link (wc:…) asking for any set of networks,
the same session proposal react-app.walletconnect.com sends.

Usage:
  npx wc-uri --network <networks> [options]
  npx wc-uri --list

Networks (comma-separated, or repeat --network):
  CAIP-2 ids     eip155:1,solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp,bip122:000000000019d6689c085ae165831e93
  names          ethereum,solana,bitcoin,tron,sepolia,solana-devnet   (see --list)
  groups         all | mainnets | testnets
  Unlisted ids of a known namespace work too, e.g. eip155:8453.

Options:
  -n, --network <list>    networks to request (required)
  -l, --list              list known networks and aliases, then exit
  -p, --project-id <id>   WalletConnect/Reown project ID; also WC_PROJECT_ID.
                          Saved to ${CONFIG_FILE} once given.
      --relay <region>    default | us | eu | ap | ws(s)://… (default: default)
      --origin <origin>   valid | invalid | unknown | http(s)://… (default: valid)
                          URL the dapp claims in its metadata
      --name <name>       dapp name shown in the wallet (default: React App)
      --icon <url>        dapp icon shown in the wallet (default: none)
      --no-auth           plain session proposal, without the SIWE / 1-CA request
      --all-methods       also request eth_signTransaction, eth_sign, eth_signTypedData*,
                          EIP-5792 and EIP-7715 methods (the web dapp does not)
      --wait              keep running until the wallet answers, then print the approved
                          accounts
      --qr                also print a QR code (to stderr)
      --open <target>     also open the link on: ios (booted simulator) | android (adb)
      --device <id>       which device --open targets: simulator name or UDID for ios,
                          adb serial for android (default: the booted simulator / only device)
      --json              print {"uri", "expiresAt", "networks"} instead of the bare link;
                          with --wait, a second line {"topic", "peer", "accounts"} follows
  -v, --verbose           WalletConnect SDK debug logs (stderr)
  -h, --help              show this help
      --version           show the version

stdout is just the link, so it can be piped:  npx wc-uri -n ethereum,solana | pbcopy
The link expires after 5 minutes. Without --wait the wallet still receives the
proposal, but nothing is listening for its answer.`;

function fail(message: string): never {
  process.stderr.write(`wc-uri: ${message}\n`);
  process.exit(1);
}

function note(message: string) {
  process.stderr.write(`${message}\n`);
}

function readConfig(): { projectId?: string } {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveProjectId(projectId: string) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...readConfig(), projectId }, null, 2) + "\n");
}

function resolveNetworks(tokens: string[]): string[] {
  const ids: string[] = [];
  for (const raw of tokens.flatMap((t) => t.split(",")).map((t) => t.trim()).filter(Boolean)) {
    const token = raw.toLowerCase();
    if (token === "all") ids.push(...NETWORKS.map((n) => n.id));
    else if (token === "mainnets") ids.push(...NETWORKS.filter((n) => !n.testnet).map((n) => n.id));
    else if (token === "testnets") ids.push(...NETWORKS.filter((n) => n.testnet).map((n) => n.id));
    else {
      // References are case-sensitive (Solana genesis hashes), so match ids as typed.
      const network = NETWORKS.find((n) => n.id === raw || n.aliases.includes(token));
      if (network) ids.push(network.id);
      else if (/^[-a-z0-9]{3,8}:[-_a-zA-Z0-9]{1,32}$/.test(raw) && Object.hasOwn(NAMESPACES, raw.split(":")[0])) ids.push(raw);
      else fail(`unknown network "${raw}". Run with --list to see known networks, or pass a CAIP-2 id.`);
    }
  }
  if (!ids.length) fail("pass --network, e.g. --network ethereum,solana (see --help)");
  return [...new Set(ids)];
}

// Mirrors getRequiredNamespaces() in the web dapp, which sends them as optionalNamespaces.
function buildNamespaces(chains: string[], allMethods: boolean) {
  const namespaces: Record<string, { chains: string[]; methods: string[]; events: string[] }> = {};
  for (const chain of chains) {
    const ns = chain.split(":")[0];
    const spec = NAMESPACES[ns];
    namespaces[ns] ??= {
      chains: [],
      methods: allMethods ? [...spec.methods, ...spec.optionalMethods] : [...spec.methods],
      events: [...spec.events],
    };
    namespaces[ns].chains.push(chain);
  }
  return namespaces;
}

function listNetworks() {
  for (const testnet of [false, true]) {
    console.log(testnet ? "\nTestnets" : "Mainnets");
    for (const n of NETWORKS.filter((x) => x.testnet === testnet)) {
      console.log(`  ${n.id.padEnd(48)} ${n.name.padEnd(28)} ${n.aliases.join(", ")}`);
    }
  }
}

const OPEN_TARGETS: Record<string, { command: (uri: string, device?: string) => [string, string[]]; hint: string }> = {
  ios: {
    command: (uri, device) => ["xcrun", ["simctl", "openurl", device ?? "booted", uri]],
    hint: "is a simulator booted? With several booted, pick one with --device",
  },
  android: {
    // adb joins its arguments into one remote shell command, so quote the URI.
    command: (uri, device) => ["adb", [...(device ? ["-s", device] : []), "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", `'${uri}'`]],
    hint: "is a device connected?",
  },
};

function openOnDevice(uri: string, target: string, device?: string) {
  const [cmd, args] = OPEN_TARGETS[target].command(uri, device);
  // simctl can block indefinitely when CoreSimulator is wedged; the link is
  // already printed, so give up rather than hang.
  return new Promise<boolean>((resolve) => execFile(cmd, args, { timeout: 15_000 }, (error) => resolve(!error)));
}

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

async function main() {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      network: { type: "string", short: "n", multiple: true },
      list: { type: "boolean", short: "l" },
      "project-id": { type: "string", short: "p" },
      relay: { type: "string", default: "default" },
      origin: { type: "string", default: "valid" },
      name: { type: "string", default: "React App" },
      icon: { type: "string" },
      "no-auth": { type: "boolean" },
      "all-methods": { type: "boolean" },
      wait: { type: "boolean" },
      qr: { type: "boolean" },
      open: { type: "string" },
      device: { type: "string" },
      json: { type: "boolean" },
      verbose: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean" },
    },
  });

  if (values.help) return console.log(HELP);
  if (values.version) return console.log(__VERSION__);
  if (values.list) return listNetworks();
  if (values.open && !Object.hasOwn(OPEN_TARGETS, values.open)) fail("--open must be ios or android");

  const chains = resolveNetworks(values.network ?? []);

  const projectId = values["project-id"] || process.env.WC_PROJECT_ID || readConfig().projectId;
  if (!projectId) {
    fail(`no project ID. Pass --project-id <id> once (it is saved to ${CONFIG_FILE}) or set WC_PROJECT_ID. Get one free at https://dashboard.reown.com`);
  }
  if (!/^[0-9a-f]{32}$/i.test(projectId)) fail(`"${projectId}" does not look like a project ID (32 hex characters)`);
  if (values["project-id"]) saveProjectId(projectId);

  const relayKey = values.relay.toLowerCase();
  const isRelayPreset = Object.hasOwn(RELAYS, relayKey);
  if (!isRelayPreset && !/^wss?:\/\//.test(values.relay)) fail("--relay must be default, us, eu, ap or a ws(s):// URL");
  const relayUrl = isRelayPreset ? RELAYS[relayKey] : values.relay;
  const originKey = values.origin.toLowerCase();
  const isOriginPreset = Object.hasOwn(ORIGINS, originKey);
  if (!isOriginPreset && !/^https?:\/\//.test(values.origin)) fail("--origin must be valid, invalid, unknown or an http(s):// URL");
  const origin = isOriginPreset ? ORIGINS[originKey] : values.origin;

  // The SDK retries an unreachable relay forever; an agent needs a clear failure instead.
  const relayTimeout = setTimeout(() => fail(`could not reach the relay within 15s (${relayUrl ?? "default"})`), 15_000);
  const client = await SignClient.init({
    projectId,
    relayUrl,
    // The SDK bundles pino's browser build, which logs with console.* (stdout in
    // Node); stdout must stay just the link.
    logger: pino({
      level: values.verbose ? "debug" : "silent",
      browser: { write: (o) => process.stderr.write(`${JSON.stringify(o)}\n`) },
    }),
    metadata: {
      name: values.name,
      description: "App to test WalletConnect network",
      url: origin,
      icons: values.icon ? [values.icon] : [],
    },
    // Nothing needs to outlive this run.
    storageOptions: { database: ":memory:" },
  });
  // The SIWE / 1-CA request the web dapp attaches; its uri/domain come from the
  // page origin. "unknown" is not a URL, so it keeps the default domain.
  let authOrigin: URL;
  try {
    authOrigin = new URL(origin);
  } catch {
    authOrigin = new URL(ORIGINS.valid);
  }

  const { uri, approval } = await client.connect({
    optionalNamespaces: buildNamespaces(chains, Boolean(values["all-methods"])),
    authentication: values["no-auth"]
      ? undefined
      : [{ uri: authOrigin.origin, domain: authOrigin.host, chains, nonce: "1", ttl: 1000 }],
  });
  clearTimeout(relayTimeout);
  if (!uri) fail("the SDK did not return a pairing URI");

  const expiresAt = new Date(Number(new URL(uri.replace(/^wc:/, "wc://")).searchParams.get("expiryTimestamp")) * 1000);

  if (values.json) console.log(JSON.stringify({ uri, expiresAt: expiresAt.toISOString(), networks: chains }));
  else console.log(uri);

  note(`${chains.length} network(s): ${chains.join(", ")}`);
  note(`expires ${expiresAt.toLocaleTimeString()}`);
  if (values.qr) qrcode.generate(uri, { small: true }, note);
  if (values.open) {
    const opened = await openOnDevice(uri, values.open, values.device);
    note(opened ? `opened on ${values.open}` : `could not open on ${values.open} (${OPEN_TARGETS[values.open].hint})`);
  }

  let code = 0;
  if (values.wait) {
    note("waiting for the wallet…");
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("the link expired before the wallet answered")), expiresAt.getTime() - Date.now()),
    );
    try {
      const session = await Promise.race([approval(), timeout]);
      const accounts = Object.values(session.namespaces).flatMap((ns) => ns.accounts);
      note(`approved by ${session.peer.metadata.name}`);
      if (values.json) console.log(JSON.stringify({ topic: session.topic, peer: session.peer.metadata, accounts }));
      else accounts.forEach((a) => note(`  ${a}`));
    } catch (e) {
      note(`not approved: ${errorMessage(e)}`);
      code = 1;
    }
  }

  // connect() resolves only after the relay acknowledged the proposal, so just
  // exit: a graceful close can wait up to 30s for the relay's close frame.
  process.exit(code);
}

main().catch((e) => fail(errorMessage(e)));
