import { isSafeColor, isSafeUrl, sanitizeCss, sanitizeText } from '../src/index';

describe('sanitizeText', () => {
  it('returns an empty string for nullish values', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('coerces everything else to a string', () => {
    expect(sanitizeText('value')).toBe('value');
    expect(sanitizeText(42)).toBe('42');
    expect(sanitizeText(0)).toBe('0');
    expect(sanitizeText(false)).toBe('false');
  });
});

describe('sanitizeCss', () => {
  it('returns an empty string for non-strings and empty input', () => {
    expect(sanitizeCss('')).toBe('');
    expect(sanitizeCss(null as unknown as string)).toBe('');
    expect(sanitizeCss(42 as unknown as string)).toBe('');
  });

  it('keeps harmless declarations', () => {
    expect(sanitizeCss('color: red')).toBe('color: red');
    expect(sanitizeCss('  color:red;  ')).toBe('color:red;');
  });

  it('strips expression() and legacy bindings', () => {
    expect(sanitizeCss('width: expression(alert(1))')).not.toContain('expression');
    expect(sanitizeCss('width: EXPRESSION(alert(1))')).not.toContain('EXPRESSION');
    expect(sanitizeCss('behavior: url(x.htc)')).not.toContain('behavior');
    expect(sanitizeCss('-moz-binding: url(x.xml)')).not.toContain('-moz-binding');
  });

  it('strips @import statements', () => {
    expect(sanitizeCss('@import url(https://evil.example.com/x.css)')).not.toContain('@import');
    expect(sanitizeCss('  @IMPORT  "x.css";')).not.toContain('@IMPORT');
  });

  it('strips script protocols anywhere in the declaration', () => {
    expect(sanitizeCss('background: url(javascript:alert(1))')).not.toContain('javascript');
    expect(sanitizeCss('background: url("vbscript:msgbox(1)")')).not.toContain('vbscript');
    expect(sanitizeCss('color: javascript:alert(1)')).not.toContain('javascript');
    expect(sanitizeCss('color: JavaScript:alert(1)')).not.toContain('JavaScript');
  });

  it('keeps safe url() values', () => {
    expect(sanitizeCss('background: url(https://cdn.example.com/bg.png)')).toBe(
      'background: url(https://cdn.example.com/bg.png)',
    );
    expect(sanitizeCss('background: url(/img/bg.png)')).toBe('background: url(/img/bg.png)');
    expect(sanitizeCss('background: url("img/bg.png")')).toBe('background: url("img/bg.png")');
  });

  it('drops url() values with dangerous or unknown protocols', () => {
    expect(sanitizeCss('background: url(file:///etc/passwd)')).not.toContain('file:');
    expect(sanitizeCss('background: url(data:image/png;base64,AAAA)')).not.toContain('data:');
    expect(sanitizeCss('background: url(data:text/html;base64,AAAA)')).not.toContain(
      'data:text/html',
    );
    expect(sanitizeCss('background: url(ftp://example.com/x.png)')).not.toContain('ftp:');
  });
});

describe('isSafeColor', () => {
  it('rejects non-strings and empty values', () => {
    expect(isSafeColor(null as unknown as string)).toBe(false);
    expect(isSafeColor(undefined as unknown as string)).toBe(false);
    expect(isSafeColor(0 as unknown as string)).toBe(false);
    expect(isSafeColor('')).toBe(false);
    expect(isSafeColor('   ')).toBe(false);
  });

  it.each(['#fff', '#FFF', '#aabbcc', '#AABBCC', '#aabbccdd'])(
    'accepts the hex color %s',
    (color) => {
      expect(isSafeColor(color)).toBe(true);
    },
  );

  it.each(['#ab', '#abcd', '#abcde', '#gggggg', 'rgb', 'rgb()', 'red', 'hsl(0, 0%, 0%)'])(
    'rejects the invalid color %s',
    (color) => {
      expect(isSafeColor(color)).toBe(false);
    },
  );

  it.each([
    'rgb(1, 2, 3)',
    'RGB(1,2,3)',
    'rgba(1, 2, 3, 0.5)',
    'rgb(100% 0% 0%)',
    'rgba(1 2 3 / 50%)',
  ])('accepts the functional color %s', (color) => {
    expect(isSafeColor(color)).toBe(true);
  });

  it('rejects injection attempts', () => {
    expect(isSafeColor('#28a745; background: url(x)')).toBe(false);
    expect(isSafeColor('url(javascript:alert(1))')).toBe(false);
  });
});

describe('isSafeUrl', () => {
  it('rejects non-strings, empty values, and whitespace', () => {
    expect(isSafeUrl(null as unknown as string)).toBe(false);
    expect(isSafeUrl(undefined as unknown as string)).toBe(false);
    expect(isSafeUrl(42 as unknown as string)).toBe(false);
    expect(isSafeUrl('')).toBe(false);
    expect(isSafeUrl('   ')).toBe(false);
  });

  it('accepts relative urls', () => {
    expect(isSafeUrl('/assets/logo.svg')).toBe(true);
    expect(isSafeUrl('assets/logo.svg')).toBe(true);
    expect(isSafeUrl('./logo.svg')).toBe(true);
  });

  it('accepts http, https, and data urls', () => {
    expect(isSafeUrl('https://cdn.example.com/logo.png')).toBe(true);
    expect(isSafeUrl('http://cdn.example.com/logo.png')).toBe(true);
    expect(isSafeUrl('data:image/png;base64,AAAA')).toBe(true);
  });

  it('rejects script and unsupported protocols', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('JaVaScRiPt:alert(1)')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeUrl('ftp://example.com/logo.png')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects urls that cannot be parsed', () => {
    expect(isSafeUrl('http://[invalid')).toBe(false);
  });
});
