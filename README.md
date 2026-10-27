# wc-uri

Generate a WalletConnect pairing link (`wc:…`) for any set of networks, without opening
[react-app.walletconnect.com](https://react-app.walletconnect.com). It sends the same session
proposal that dapp does (same namespaces, methods, events and SIWE / 1-CA request), so it is
handy for testing a wallet's connect screen with lots of chains.

```sh
npx wc-uri --project-id <id> --network ethereum,solana   # first run saves the project ID
npx wc-uri --network ethereum,solana,bitcoin,tron,eip155:8453
npx wc-uri --network mainnets
npx wc-uri --list
```

stdout is only the link, so it pipes cleanly: `npx wc-uri -n all | pbcopy`. Progress goes to stderr.

## Networks

`--network` takes a comma-separated list (or repeat the flag) of:

- **CAIP-2 ids**: `eip155:1`, `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`, `bip122:000000000019d6689c085ae165831e93`
- **names**: `ethereum`, `sepolia`, `solana-devnet`, `bitcoin`, `tron-testnet-nile`, … (`--list` shows every alias)
- **groups**: `all`, `mainnets`, `testnets`: the chain lists from the web dapp's "Testnets Only?" toggle

Ids missing from the list still work if their namespace is known (`eip155:8453`). Namespaces:
eip155, solana, bip122, tron, ton, cosmos, polkadot, near, mvx, tezos, kadena, sui, stacks,
canton, stellar.

## Options

| Option | |
| --- | --- |
| `-p, --project-id <id>` | Reown/WalletConnect project ID ([dashboard.reown.com](https://dashboard.reown.com)). Saved to `~/.wc-uri/config.json`; `WC_PROJECT_ID` also works. |
| `--relay <region>` | `default`, `us`, `eu`, `ap` or a `ws(s)://` URL (the web dapp's "Relayer Region") |
| `--origin <origin>` | `valid`, `invalid`, `unknown` or an `http(s)://` URL (the web dapp's "Origin Url") |
| `--name`, `--icon` | dapp name / icon shown in the wallet (default `React App`, no icon) |
| `--no-auth` | plain session proposal, without the SIWE / 1-CA sign-in request |
| `--all-methods` | also request `eth_signTransaction`, `eth_sign`, `eth_signTypedData*`, EIP-5792/7715 |
| `--wait` | stay running until the wallet answers, then print the approved accounts |
| `--qr` | print a QR code to stderr |
| `--open ios\|android` | open the link on the booted iOS simulator (`xcrun simctl openurl`) or via `adb` |
| `--device <id>` | which device `--open` uses: simulator name or UDID (`simctl`), or adb serial. Needed when several simulators are booted |
| `--json` | print `{"uri","expiresAt","networks"}`; with `--wait`, a second line `{"topic","peer","accounts"}` follows |
| `-v, --verbose` | WalletConnect SDK debug logs (stderr) |

## Notes

- A link lasts 5 minutes. Without `--wait` the CLI exits right away: the proposal is already on
  the relay, so the wallet still shows it, but nothing is listening for the approval.
- Verify only runs in a browser, so wallets will show this dapp as unverified or unknown whatever
  `--origin` says. `--origin` changes the URL in the dapp metadata and the SIWE domain.

## Develop

```sh
npm install
npm run build        # bundles src/ into dist/cli.js (no runtime dependencies)
node dist/cli.js --help
```

### Release

Pushing a `v*` tag runs [`.github/workflows/publish.yml`](.github/workflows/publish.yml), which
typechecks, builds, smoke-tests and publishes to npm. The tag must match `package.json`'s version,
and the repo needs an `NPM_TOKEN` secret (an npm automation or granular token with publish rights).

```sh
npm version patch      # bumps package.json and creates the v… tag
git push --follow-tags
```

`src/networks.ts` comes from the web dapp's source
(`reown-com/web-examples/advanced/dapps/react-dapp-v2`). Regenerate it if that changes.
