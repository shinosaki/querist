import ip6 from 'ip6';
import { getIpv4Range } from './ip';

const useragent = { 'user-agent': 'curl/7.80.0' };

export const IANA_Assign_AS = async (c) => {
  const { status } = c.req.query();

  const urls = [
    'https://www.iana.org/assignments/as-numbers/as-numbers-1.csv',
    'https://www.iana.org/assignments/as-numbers/as-numbers-2.csv',
  ];

  const csvs = await Promise.all(
    urls.map(url => fetch(url, {
      headers: useragent,
      cf: {
        cacheTtl: 2630000,
        cacheEverything: true
      }
    }).then(r => r.text())
    )
  );

  const csv = [
    ...csvs[0].split('\r\n').slice(1).filter(v => v),
    ...csvs[1].split('\r\n').slice(2).filter(v => v)
  ];

  const data = csv
    .map(v => v.split(','))
    .map(([ asn, description, whois, rdap, reference, registration ]) => {
      const [ start, end ] = asn.split('-');

      return {
        range: { start, end: end ?? start },
        rdap: rdap.replaceAll('"', '').split('\n'),
        status: description.split(' ')[0].toUpperCase(),
        asn, whois, reference, registration, description
      }
    });

  return c.json({
    data: (status)
      ? status.toUpperCase().split(',').map(s => data.filter(({ status }) => s.includes(status)))
      : data
  });
}

export const IANA_Assign_IPv4 = async (c) => {
  const { status } = c.req.query();

  const url = 'https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv';
  const csv = await fetch(url, {
    headers: useragent,
    cf: {
      cacheTtl: 2630000,
      cacheEverything: true
    }
  }).then(r => r.text());

  const data = csv.split('\r\n').slice(1)
    .filter(v => v)
    .map(v => v.split(','))
    .map(([ prefix, designation, date, whois, rdap, status, note = '' ]) => {
      const [ head, range ] = prefix.split('/');
      const ip = Math.trunc(head) + '.0.0.0';
      const cidr = `${ip}/${range}`;
      const [ start, end ] = getIpv4Range(cidr);

      return {
        address: { ip, range, cidr },
        range: { start, end },
        note: note.split(/[\[\]]/).filter(v=>v),
        prefix, designation, date, whois, rdap, status };
    });

  return c.json({
    data: (status)
      ? status.toUpperCase().split(',').map(s => data.filter(({ status }) => s.includes(status)))
      : data,
    notes: {
      // Access to "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml"
      // and Execute this scirpt in DevTools
      // 
      // let obj = {};
      // [...document.querySelectorAll('table.fn > tbody > tr')].map((e, i) =>
      //   obj = {
      //     ...obj,
      //     ...{
      //       [i + 1]: e.querySelector('td:last-child > pre').innerHTML
      //     }
      //   }
      // );
      // console.log(obj)
       1: "Indicates the status of address blocks as follows:\nRESERVED: designated by the IETF for specific non-global-unicast purposes as noted.\nLEGACY: allocated by the central Internet Registry (IR) prior to the Regional Internet Registries\n(RIRs). This address space is now administered by individual RIRs as noted, including maintenance\nof WHOIS Directory and reverse DNS records. Assignments from these blocks are distributed globally\non a regional basis.\nALLOCATED: delegated entirely to specific RIR as indicated.\nUNALLOCATED: not yet allocated or reserved.",
       2: "0.0.0.0/8 reserved for self-identification [<a href=\"https://www.iana.org/go/rfc791\">RFC791</a>], section 3.2.\nReserved by protocol. For authoritative registration, see [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       3: "0.0.0.0/32 reserved for self-identification [<a href=\"https://www.iana.org/go/rfc1122\">RFC1122</a>], section 3.2.1.3.\nReserved by protocol. For authoritative registration, see [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       4: "Reserved for Private-Use Networks [<a href=\"https://www.iana.org/go/rfc1918\">RFC1918</a>].\nComplete registration details for 10.0.0.0/8 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       5: "This was reserved for Public Data Networks [<a href=\"https://www.iana.org/go/rfc1356\">RFC1356</a>]. See [<a href=\"https://www.iana.org/assignments/public-data-network-numbers\">IANA registry <i>public-data-network-numbers</i></a>].\nIt was recovered in February 2008 and was subsequently allocated to APNIC in April 2010.",
       6: "100.64.0.0/10 reserved for Shared Address Space [<a href=\"https://www.iana.org/go/rfc6598\">RFC6598</a>]. \nComplete registration details for 100.64.0.0/10 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       7: "127.0.0.0/8 reserved for Loopback [<a href=\"https://www.iana.org/go/rfc1122\">RFC1122</a>], section 3.2.1.3. \nReserved by protocol. For authoritative registration, see [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       8: "169.254.0.0/16 reserved for Link Local [<a href=\"https://www.iana.org/go/rfc3927\">RFC3927</a>].\nReserved by protocol. For authoritative registration, see [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
       9: "172.16.0.0/12 reserved for Private-Use Networks [<a href=\"https://www.iana.org/go/rfc1918\">RFC1918</a>]. \nComplete registration details are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      10: "192.0.2.0/24  reserved for TEST-NET-1 [<a href=\"https://www.iana.org/go/rfc5737\">RFC5737</a>]. \nComplete registration details for 192.0.2.0/24 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].\n192.88.99.0/24 reserved for 6to4 Relay Anycast [<a href=\"https://www.iana.org/go/rfc7526\">RFC7526</a>]\nComplete registration details for 192.88.99.0/24 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].\n192.88.99.2/32 reserved for 6a44 Relay Anycast [<a href=\"https://www.iana.org/go/rfc6751\">RFC6751</a>] (possibly collocated with 6to4 Relay \nat 192.88.99.1/32 - see [<a href=\"https://www.iana.org/go/rfc7526\">RFC7526</a>])\n192.168.0.0/16 reserved for Private-Use Networks [<a href=\"https://www.iana.org/go/rfc1918\">RFC1918</a>]. \nComplete registration details for 192.168.0.0/16 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      11: "192.0.0.0/24 reserved for IANA IPv4 Special Purpose Address Registry [<a href=\"https://www.iana.org/go/rfc5736\">RFC5736</a>]. \nComplete registration details for 192.0.0.0/24 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      12: "198.18.0.0/15 reserved for Network Interconnect Device Benchmark Testing [<a href=\"https://www.iana.org/go/rfc2544\">RFC2544</a>]. \nComplete registration details for 198.18.0.0/15 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].\n198.51.100.0/24 reserved for TEST-NET-2 [<a href=\"https://www.iana.org/go/rfc5737\">RFC5737</a>]. \nComplete registration details for 198.51.100.0/24 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      13: "203.0.113.0/24 reserved for TEST-NET-3 [<a href=\"https://www.iana.org/go/rfc5737\">RFC5737</a>]. \nComplete registration details for 203.0.113.0/24 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      14: "Multicast (formerly \"Class D\") [<a href=\"https://www.iana.org/go/rfc5771\">RFC5771</a>] registered in [<a href=\"https://www.iana.org/assignments/multicast-addresses\">IANA registry <i>multicast-addresses</i></a>]",
      15: "Unicast-Prefix-Based IPv4 Multicast Addresses [<a href=\"https://www.iana.org/go/rfc6034\">RFC6034</a>]",
      16: "Administratively Scoped IP Multicast [<a href=\"https://www.iana.org/go/rfc2365\">RFC2365</a>]",
      17: "Reserved for future use (formerly \"Class E\") [<a href=\"https://www.iana.org/go/rfc1112\">RFC1112</a>].\nReserved by protocol. For authoritative registration, see [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>].",
      18: "255.255.255.255 is reserved for \"limited broadcast\" destination address [<a href=\"https://www.iana.org/go/rfc919\">RFC919</a>] and [<a href=\"https://www.iana.org/go/rfc922\">RFC922</a>].\nComplete registration details for 255.255.255.255/32 are found in [<a href=\"https://www.iana.org/assignments/iana-ipv4-special-registry\">IANA registry <i>iana-ipv4-special-registry</i></a>]."
    }
  });
}

export const IANA_Assign_IPv6 = async (c) => {
  const { status } = c.req.query();

  const url = 'https://www.iana.org/assignments/ipv6-unicast-address-assignments/ipv6-unicast-address-assignments.csv';
  const csv = await fetch(url, {
    headers: useragent,
    cf: {
      cacheTtl: 2630000,
      cacheEverything: true
    }
  }).then(r => r.text());

  const data = csv.split('\r\n').slice(1)
    .filter(v => v)
    .map(v => v.split(','))
    .map(([ prefix, designation, date, whois, rdap, status, note = '' ]) => {
      const [ head, range ] = prefix.split('/');
      const ip = head + '0';
      const { start, end } = ip6.range(head, range, 128);

      return {
        address: { ip, range, cidr: prefix },
        range: { start, end },
        note: note.split(/[\[\]]/).filter(v=>v),
        prefix, designation, date, whois, rdap, status };
    });

  return c.json({
    data: (status)
      ? status.toUpperCase().split(',').map(s => data.filter(({ status }) => s.includes(status)))
      : data
  });
}
