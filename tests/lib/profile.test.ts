import { describe, expect, it } from 'vitest';
import { profileLinks } from '../../src/lib/profile';
import { pt } from '../../src/i18n/pt';

describe('profileLinks', () => {
  it('segue a ordem fixa do schema, não a do objeto, e põe o CV por último', () => {
    const links = {
      github: 'https://github.com/x',
      orcid: 'https://orcid.org/0000',
      lattes: 'http://lattes.cnpq.br/1',
    };
    expect(profileLinks(links, 'https://drive/cv.pdf', pt.about.links)).toEqual([
      { href: 'http://lattes.cnpq.br/1', label: 'Currículo Lattes' },
      { href: 'https://orcid.org/0000', label: 'ORCID' },
      { href: 'https://github.com/x', label: 'GitHub' },
      { href: 'https://drive/cv.pdf', label: 'Currículo em PDF' },
    ]);
  });

  it('campo vazio não entra (RF-21)', () => {
    expect(profileLinks({ lattes: 'http://lattes.cnpq.br/1' }, undefined, pt.about.links)).toEqual([
      { href: 'http://lattes.cnpq.br/1', label: 'Currículo Lattes' },
    ]);
  });

  it('sem links nem CV devolve lista vazia', () => {
    expect(profileLinks(undefined, undefined, pt.about.links)).toEqual([]);
  });
});
