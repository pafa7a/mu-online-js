import {deleteCookie} from 'cookies-next';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed.'
    });
  }
  deleteCookie('token', {req, res,});
  return res.status(200).send();
}
