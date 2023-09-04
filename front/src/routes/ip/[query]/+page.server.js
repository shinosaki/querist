import { PUBLIC_API } from '$env/static/public';

export const load = async ({ fetch, params }) => {
  const { query } = params;

  const info = await fetch(`${PUBLIC_API}/ip/${query}`)
    .then(r => r.json());

  const whois = await fetch(`${PUBLIC_API}/whois/${query}?json`)
    .then(r => r.json());

  return {
    info,
    whois,
  };
};