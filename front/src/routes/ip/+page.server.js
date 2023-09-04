import { redirect } from '@sveltejs/kit';
import { getIP } from '$lib';

export const load = ({ fetch, request, getClientAddress }) => {
  const { headers } = request;
  const { ip } = getIP({ headers, getClientAddress });

  throw redirect(302, `/ip/${ip}`);
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    console.log(data)
    const query = data.get('query');

    throw redirect(302, `/ip/${query}`);
  }
};