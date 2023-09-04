export const getIP = ({
  headers,
  getClientAddress,
}) => {
  const clientip = getClientAddress();
  const cfip = headers.get('CF-Connecting-IP');
  const xfip = headers.get('X-Forwarded-For');
  
  const ip = (cfip) ? cfip
           : (xfip) ? xfip
           : (clientip) ? clientip
           : '127.0.0.1';

  return {
    clientip,
    cfip,
    xfip,
    ip,
  };
};