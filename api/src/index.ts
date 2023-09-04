import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ip6 from 'ip6';
import { contains } from 'cidr-tools';
import { getIP } from './ip';
import { whois } from './whois';
import { IANA_Assign_AS, IANA_Assign_IPv4, IANA_Assign_IPv6 } from './iana-assign';

const useragent = { 'user-agent': 'curl/7.80.0' };

const app = new Hono();

app.use('*', cors());

app.get('/ip/', (c) => c.redirect('/ip'));
app.get('/ip', (c) => {
  const { headers } = c.req;
  const { ip } = getIP(headers);
  return c.redirect(`/ip/${ip}`);
});
app.get('/ip/:query', async (c) => {
  const { query }  = c.req.param();

  const ipapi = await fetch(`http://ip-api.com/json/${query}`)
    .then(r => r.json())
    .catch(e => console.log(e));

  if (!ipapi) {
    return c.json({
      status: false,
      message: 'Failed to fetch API',
      query
    }, 500);
  } else if (ipapi.status === 'fail') {
    return c.json({
      status: false,
      message: ipapi.message,
      query
    }, 404)
  };

  return c.json({
    status: true,
    ip: query,
    latitude: ipapi.lat,
    longitude: ipapi.lon,
    iso3166: ipapi.countryCode,
    region: ipapi.country,
    state: ipapi.regionName,
    city: ipapi.city,
    zip: ipapi.zip,
    isp: ipapi.isp,
    org: ipapi.org,
    asn: (ipapi.as) ? ipapi.as.match(/AS\d+/)[0] : null,
  });
});

// app.get('/as/:query', (c) => {
//   // const url = new URL(c.req.url);
//   // const { query } = c.req.param();

//   // const asn = query.toUpperCase().replace('AS', '');
//   // if (!Number(asn)) {
//   //   return c.json({
//   //     status: false,
//   //     message: 'Invalid format query. (e.g. AS1234, as1234, 1234)',
//   //     query
//   //   }, 404)
//   // };

//   // const ipinfo = await fetch(`https://ipinfo.io/widget/demo/AS${asn}`, {
//   //   referrer: 'https://ipinfo.io/products/asn-api'
//   // }).then(r => r.json());

//   // return c.json({
//   //   status: true,
//   //   asn: ipinfo.asn,
//   //   name: ipinfo.name,
//   //   iso3166: ipinfo.country,
//   // })

//   // const rdap = await fetch(`${url.origin}/rdap/AS${asn}`)
//   //   .then(r => r.json());

//   // return c.json({
//   //   status: true,
//   //   asn: rdap.handle,
//   //   name: rdap.name,
//   //   // latitude: ipapi.lat,
//   //   // longitude: ipapi.lon,
//   //   iso3166: ipapi.countryCode,
//   //   region: ipapi.country,
//   //   state: ipapi.regionName,
//   //   city: ipapi.city,
//   //   zip: ipapi.zip,
//   //   isp: ipapi.isp,
//   //   org: ipapi.org,
//   //   asn: (ipapi.as) ? ipapi.as.match(/AS\d+/)[0] : null,
//   // });
// });

app.get('/rdap/:Query/:Range?', async (c) => {
  const url = new URL(c.req.url);
  const { Query, Range } = c.req.param();
  const { json } = c.req.query();

  const regex = {
    as: /^as\d+$/i,
    ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
    ipv6: /^(([\w\d]{1,4})?:{1,2}){1,7}([\w\d]{1,4})?$/i,
    range: /^\d{1,3}$/,
  };

  if (Range && !Range.match(regex.range)) {
    return c.json({
      status: false,
      message: 'Invalid range',
    }, 404);
  } else if (!Query.match(regex.as) && !Query.match(regex.ipv4) && !Query.match(regex.ipv6)) {
    return c.json({
      status: false,
      message: 'Invalid query',
    }, 404);
  };

  let type, query = Query.toUpperCase();
  if (Query.match(regex.as)) {
    type = 'as';
    query = query.replace('AS', '');
  } else if (Query.match(regex.ipv4)) {
    type = 'ipv4';
    query += (Range) ? `/${Range}` : '';
  } else if (Query.match(regex.ipv6)) {
    type = 'ipv6';
    query += (Range) ? `/${Range}` : '';
  };

  let assign, server;
  switch (type) {
    case 'as':
      assign = await IANA_Assign_AS(c).then(r => r.json());
      server = assign.data.find(({ range: { start, end } }) =>
        start <= query && query <= end
      )?.rdap;
      break;

    case 'ipv4':
      assign = await IANA_Assign_IPv4(c).then(r => r.json());
      server = assign.data.find(({ address: { cidr } }) => {
        try { return contains(cidr, query) } catch { return false };
      })?.rdap;
      break;

    case 'ipv6':
      assign = await IANA_Assign_IPv6(c).then(r => r.json());
      server = assign.data.find(({ address: { cidr } }) => {
        try { return contains(cidr, query) } catch { return false };
      })?.rdap;
      break;

    default:
      return c.json({ status: false }, 404);
  };

  if (!server) {
    return c.json({
      status: false,
      message: 'Cannot find whois server'
    });
  };

  const path = (type === 'as') ? 'autnum' : 'ip';
  const res = await fetch(`${server[0]}/${path}/${query}`);
  const rdap = await res.json();

  return c.json({
    status: res.ok,
    query,
    rdap
  }, res.status);
});

app.get('/whois/:Query/:Range?', async (c) => {
  const url = new URL(c.req.url);
  const { Query, Range } = c.req.param();
  const { json } = c.req.query();

  const regex = {
    as: /^as\d+$/i,
    ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
    ipv6: /^(([\w\d]{1,4})?:{1,2}){1,7}([\w\d]{1,4})?$/i,
    range: /^\d{1,3}$/,
  };

  if (Range && !Range.match(regex.range)) {
    return c.json({
      status: false,
      message: 'Invalid range',
    }, 404);
  } else if (!Query.match(regex.as) && !Query.match(regex.ipv4) && !Query.match(regex.ipv6)) {
    return c.json({
      status: false,
      message: 'Invalid query',
    }, 404);
  };

  let type, query = Query.toUpperCase();
  if (Query.match(regex.as)) {
    type = 'as';
    query = query.replace('AS', '');
  } else if (Query.match(regex.ipv4)) {
    type = 'ipv4';
    query += (Range) ? `/${Range}` : '';
  } else if (Query.match(regex.ipv6)) {
    type = 'ipv6';
    query += (Range) ? `/${Range}` : '';
  };

  let assign, server;
  switch (type) {
    case 'as':
      assign = await IANA_Assign_AS(c).then(r => r.json());
      server = assign.data.find(({ range: { start, end } }) =>
        start <= query && query <= end
      )?.whois;
      break;

    case 'ipv4':
      assign = await IANA_Assign_IPv4(c).then(r => r.json());
      server = assign.data.find(({ address: { cidr } }) => {
        try { return contains(cidr, query) } catch { return false };
      })?.whois;
      break;

    case 'ipv6':
      assign = await IANA_Assign_IPv6(c).then(r => r.json());
      server = assign.data.find(({ address: { cidr } }) => {
        try { return contains(cidr, query) } catch { return false };
      })?.whois;
      break;

    default:
      return c.json({ status: false }, 404);
  };

  if (!server) {
    return c.json({
      status: false,
      message: 'Cannot find whois server'
    }, 404);
  };

  const whoisText = await whois({ query, server });

  return (json !== null && json !== undefined)
    ? c.json({
        status: true,
        query,
        whois: whoisText
      })
    : c.text(whoisText);
});

app.get('/iana/assign/as', async (c) => await IANA_Assign_AS(c));
app.get('/iana/assign/ipv4', async (c) => await IANA_Assign_IPv4(c));
app.get('/iana/assign/ipv6', async (c) => await IANA_Assign_IPv6(c));

export default app;
