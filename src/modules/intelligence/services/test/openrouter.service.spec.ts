import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mockDependency } from '@/shared/helpers';
import { OpenRouterService } from '../openrouter.service';

describe('OpenRouterService', () => {
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let service: OpenRouterService;
  let loggerErrorSpy: jest.SpyInstance;
  let fetchMock: jest.Mock;

  const completion = (content: string) => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] })
  });

  beforeEach(() => {
    configService = { get: jest.fn() };
    configService.get.mockImplementation((key: string) => (key === 'OPENROUTER_API_KEY' ? 'test-key' : undefined));
    service = new OpenRouterService(mockDependency<ConfigService>(configService));
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    // Remove the stub rather than restoring the real fetch — reading Node's lazy
    // global fetch would initialise undici and leave its keep-alive handle open,
    // which stops the Jest worker exiting cleanly.
    Reflect.deleteProperty(globalThis, 'fetch');
    loggerErrorSpy.mockRestore();
  });

  it('defaults to Claude Opus 4.8 via OpenRouter', () => {
    expect(service.model).toBe('anthropic/claude-opus-4-8');
  });

  it('uses the configured model when OPENROUTER_MODEL is set', () => {
    configService.get.mockImplementation((key: string) =>
      key === 'OPENROUTER_MODEL' ? 'openai/gpt-5' : 'test-key'
    );

    expect(service.model).toBe('openai/gpt-5');
  });

  it('parses the JSON content returned by the model', async () => {
    fetchMock.mockResolvedValueOnce(completion('{"matches":[{"userId":"u1","score":80,"reasoning":"fits"}]}'));

    const result = await service.completeJson<{ matches: unknown[] }>('system', 'user');

    expect(result.matches).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends the prompts and requests a JSON response', async () => {
    fetchMock.mockResolvedValueOnce(completion('{}'));

    await service.completeJson('system prompt', 'user prompt');

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.model).toBe('anthropic/claude-opus-4-8');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.messages).toEqual([
      { role: 'system', content: 'system prompt' },
      { role: 'user', content: 'user prompt' }
    ]);
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });

  it('throws ServiceUnavailableException when the API key is missing', async () => {
    configService.get.mockReturnValue(undefined);

    const promise = service.completeJson('system', 'user');

    await expect(promise).rejects.toThrow(ServiceUnavailableException);
    await expect(promise).rejects.toThrow("Le service d'IA n'est pas configuré");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws ServiceUnavailableException when OpenRouter returns an error status', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

    const promise = service.completeJson('system', 'user');

    await expect(promise).rejects.toThrow(ServiceUnavailableException);
    await expect(promise).rejects.toThrow("Le service d'IA est indisponible");
  });

  it('throws ServiceUnavailableException when the request fails outright', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    await expect(service.completeJson('system', 'user')).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws ServiceUnavailableException when the completion is empty', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [] }) });

    const promise = service.completeJson('system', 'user');

    await expect(promise).rejects.toThrow(ServiceUnavailableException);
    await expect(promise).rejects.toThrow("Réponse de l'IA vide");
  });

  it('throws ServiceUnavailableException when the model returns non-JSON content', async () => {
    fetchMock.mockResolvedValueOnce(completion('I cannot answer that.'));

    const promise = service.completeJson('system', 'user');

    await expect(promise).rejects.toThrow(ServiceUnavailableException);
    await expect(promise).rejects.toThrow("Réponse de l'IA illisible");
  });
});
