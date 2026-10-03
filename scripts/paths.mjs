export function basePath(value = process.env.BASE_PATH || '') {
  const base = value.replace(/\/+$/, '');
  if (base && !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(base)) {
    throw new Error('BASE_PATH doit être vide ou un chemin comme /airea.');
  }
  return base;
}

export function prefixUrls(content, base) {
  if (!base) return content;
  const routes = '(?:assets/|Images/|embeds/|data/|expertises/|tools/|blog/|contact/|index\\.html|entreprise\\.html|blog\\.html|mentions-legales\\.html|404\\.html)';
  const quoted = new RegExp('(["\'`])(/)(?=' + routes + ')', 'g');
  return content.replace(quoted, '$1' + base + '/')
    .replace(/(url\(\s*)\/(?=assets\/)/g, '$1' + base + '/');
}

export function localPath(pathname, base) {
  if (!base) return pathname;
  if (pathname === base || pathname === base + '/') return '/index.html';
  if (!pathname.startsWith(base + '/')) throw new Error('Lien hors du site : ' + pathname);
  return pathname.slice(base.length);
}
