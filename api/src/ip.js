export const getIP = (headers) => {
  const cfip = headers.get('CF-Connecting-IP');
  const xfip = headers.get('X-Forwarded-For');
  
  const ip = (cfip) ? cfip
           : (xfip) ? xfip
           : '127.0.0.1';

  return {
    cfip,
    xfip,
    ip,
  };
};

const intToIpv4 = (int) => {
  return [
    int >> 24 & 255,
    int >> 16 & 255,
    int >> 8 & 255,
    int & 255
  ].join('.');
};

export const getIpv4Range = (cidr) => {
  const [ip, mask] = cidr.split('/');

  const maskBin = (1 << 32 - mask) - 1;
  const ipBin = ip.split('.')
    .reduce((acc, cur) => (acc << 8) + parseInt(cur), 0);

  const startIpBin = ipBin & ~maskBin;
  const endIpBin = startIpBin | maskBin;

  return [intToIpv4(startIpBin), intToIpv4(endIpBin)];
};
