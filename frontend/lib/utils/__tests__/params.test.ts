import { buildParams } from '../params';

describe('buildParams', () => {
  it('returns empty object for empty input', () => {
    expect(buildParams({})).toEqual({});
  });

  it('strips undefined values', () => {
    expect(buildParams({ a: 'hello', b: undefined })).toEqual({ a: 'hello' });
  });

  it('strips null values', () => {
    expect(buildParams({ a: 'hello', b: null })).toEqual({ a: 'hello' });
  });

  it('strips empty string values', () => {
    expect(buildParams({ a: 'hello', b: '' })).toEqual({ a: 'hello' });
  });

  it('converts numbers to strings', () => {
    expect(buildParams({ page: 2 })).toEqual({ page: '2' });
  });

  it('converts booleans to strings', () => {
    expect(buildParams({ hasDocuments: true })).toEqual({ hasDocuments: 'true' });
  });

  it('keeps all defined, non-empty values', () => {
    const result = buildParams({
      status: 'new',
      page: 1,
      companySearch: 'acme',
    });
    expect(result).toEqual({ status: 'new', page: '1', companySearch: 'acme' });
  });

  it('does not mutate the input object', () => {
    const input = { a: 'hello', b: undefined };
    buildParams(input);
    expect(input).toEqual({ a: 'hello', b: undefined });
  });
});
