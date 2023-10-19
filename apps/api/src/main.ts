import { WEBAPP, createData, listened } from './constants';
import { createApp, startApp } from './modules/core/helpers';

startApp(createApp(WEBAPP, createData), listened);
