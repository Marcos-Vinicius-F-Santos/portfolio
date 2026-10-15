import { describe, expect, it, vi } from 'vitest';
import {
  sendContactEmail,
  WEB3FORMS_ENDPOINT,
} from './contact-email-sender';

describe('contact-email-sender', () => {
  const validParams = {
    accessKey: 'test-access-key-123',
    name: 'João Vitor',
    email: 'visitante@exemplo.com',
    message: 'Olá, gostei do seu portfólio!',
    subject: 'Proposta de Projeto',
  };

  it('fails fast when accessKey is empty', async () => {
    const fetchFn = vi.fn();
    const result = await sendContactEmail({
      ...validParams,
      accessKey: '   ',
      fetchFn,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('missing');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('calls Web3Forms endpoint with proper payload and headers', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Message delivered' }),
    });

    const result = await sendContactEmail({
      ...validParams,
      fetchFn,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Message delivered');
    expect(fetchFn).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = fetchFn.mock.calls[0];
    expect(calledUrl).toBe(WEB3FORMS_ENDPOINT);
    expect(calledInit.method).toBe('POST');
    expect(calledInit.headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = JSON.parse(calledInit.body);
    expect(body.access_key).toBe('test-access-key-123');
    expect(body.name).toBe('João Vitor');
    expect(body.email).toBe('visitante@exemplo.com');
    expect(body.message).toBe('Olá, gostei do seu portfólio!');
    expect(body.subject).toBe('Proposta de Projeto');
    expect(body.botcheck).toBe('');
  });

  it('handles API error responses gracefully', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ success: false, message: 'Invalid access key' }),
    });

    const result = await sendContactEmail({
      ...validParams,
      fetchFn,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid access key');
  });

  it('handles network exceptions gracefully without throwing', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network offline'));

    const result = await sendContactEmail({
      ...validParams,
      fetchFn,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network offline');
  });
});
