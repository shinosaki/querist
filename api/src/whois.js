import { connect } from 'cloudflare:sockets';

export const whois = async ({
  query,
  server = 'whois.iana.org',
  port = 43
}) => {
  const whoisQuery = new TextEncoder().encode(`${query}\r\n`);

  const { writable, readable } = connect(`${server}:${port}`);
  const reader = readable.getReader();
  const writer = writable.getWriter();

  await writer.write(whoisQuery);

  let body = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break
    };

    body += new TextDecoder().decode(value);
  };

  return body;
};