import type { ExistingProvider, Type } from '@nestjs/common';

export const createAliasProviders = (providers: Type<any>[]): ExistingProvider[] => {
    const aliasProviders: ExistingProvider[] = [];
    for (const p of providers) {
        aliasProviders.push({
            provide: p.name,
            useExisting: p,
        });
    }
    return aliasProviders;
};
