# Querist

Querist is like `ip.me` or `ipleak.net` on Cloudflare Workers.

## Features
- [ ] DNS and WHOIS Lookup (with [connect() API](https://blog.cloudflare.com/workers-tcp-socket-api-connect-databases/))
  - [x] WHOIS Lookup for IPv4, IPv6 and ASN

## API

API provides the following functionality:

- `/whois/<query>`
  Lookup to RIR's whois server.

  Supports:
  - IPv4
  - IPv4 CIDR
  - IPv6
  - IPv6 CIDR
  - AS Number

  Examples:
  - [`/whois/1.1.1.1`](https://api.ip.lain.im/whois/1.1.1.1)
  - [`/whois/1.0.0.0/8`](https://api.ip.lain.im/whois/1.0.0.0/8)
  - [`/whois/2606:4700::`](https://api.ip.lain.im/whois/2606:4700::)
  - [`/whois/AS123`](https://api.ip.lain.im/whois/AS123)

- [`/iana/assign/as`](https://api.ip.lain.im/iana/assign/as)
  IANA's ["Autonomous System (AS) Numbers"](https://www.iana.org/assignments/as-numbers/as-numbers.xhtml) to JSON.
- [`/iana/assign/ipv4`](https://api.ip.lain.im/iana/assign/ipv4)
  IANA's ["IANA IPv4 Address Space Registry"](https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml) to JSON.
- [`/iana/assign/ipv6`](https://api.ip.lain.im/iana/assign/ipv6)
  IANA's ["IPv6 Global Unicast Address Assignments"](https://www.iana.org/assignments/ipv6-unicast-address-assignments/ipv6-unicast-address-assignments.xhtml) to JSON.

## Deploy

### API
1. `cd ./api`
2. `npm i`
3. Edit `wrangler.toml`
4. `npm run deploy`

### Front
1. `cd ./front`
2. `npm i`
3. Edit `PUBLIC_API` in `.env`
4. `npm run deploy`

## Credit
IP geolocation data is provided by [ip-api](https://ip-api.com).

Map Data is provided by [OpenStreetMap](https://www.openstreetmap.org/). Maps are rendered using the [Leaflet](https://leafletjs.com/).

## Author
[@shinosaki](https://shinosaki.com)

## LICENCE
MIT
