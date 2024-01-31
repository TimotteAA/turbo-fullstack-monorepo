#!/usr/bin/env node
import { createData } from '@/constants';
import { createApp, createCLI } from '@/modules/core/helpers';

createCLI(createApp('test', createData));
