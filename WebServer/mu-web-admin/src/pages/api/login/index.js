import {SignJWT} from 'jose';
import { setCookie } from 'cookies-next';
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed.'
    });
  }
  const {username, password} = req.body;
  if (username !== process.env.LOGIN_USERNAME || password !== process.env.LOGIN_PASSWORD) {
    return res.status(400).json({
      message: 'Invalid username or password.'
    });
  }
  const token = await new SignJWT({username})
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET));
  setCookie('token', token, {req, res, maxAge: 60 * 60 * 24, httpOnly: true, path: '/'});
  return res.status(200).send();
}
