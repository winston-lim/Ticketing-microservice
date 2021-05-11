import express from 'express';
import 'express-async-errors';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import  { signUpRouter } from './routes/signup';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/not-found-error';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true); //traffic is being proxied to our app throug ingress-nginx, without this setting, express does not trust the HTTPS connection
app.use(express.json());
app.use(
  cookieSession({
    signed: false, //no encryption on cookie content
    secure: true,  //require a HTTPS connection for this route
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('/*', ()=> {
  console.log('No such route')
  throw new NotFoundError();
})
app.use(errorHandler);

export {app};