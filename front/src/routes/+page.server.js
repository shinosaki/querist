import { PUBLIC_API } from '$env/static/public';
import { getIP } from '$lib';

export const load = async ({ fetch, request, getClientAddress }) => {
  const { headers } = request;
  const { ip } = getIP({ headers, getClientAddress });

  const info = await fetch(`${PUBLIC_API}/ip/${ip}`)
    .then(r => r.json());

  const whois = await fetch(`${PUBLIC_API}/whois/${ip}?json`)
    .then(r => r.json());

  return {
    info,
    whois,
  };
}