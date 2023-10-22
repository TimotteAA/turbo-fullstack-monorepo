#!/usr/bin/env node
import { createData } from '@/constants';
import { createCLI, createApp } from '@/modules/core/helpers';

createCLI(createApp('test', createData));
