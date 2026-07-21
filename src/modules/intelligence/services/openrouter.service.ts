import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface IOpenRouterResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Single gateway for every AI call in the platform.
 *
 * OpenRouter fronts several providers (Anthropic, OpenAI, Kimi), so the model is a
 * configuration value rather than a code dependency — swap OPENROUTER_MODEL to change
 * provider without touching a handler.
 */
@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly fallbackModel = 'anthropic/claude-opus-4-8';

  constructor(private readonly configService: ConfigService) {}

  /** The model identifier stored on Match.method and Recommendation.modelVersion. */
  get model(): string {
    return this.configService.get<string>('OPENROUTER_MODEL') ?? this.fallbackModel;
  }

  /** Sends a prompt and parses the model's reply as JSON. */
  async completeJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException("Le service d'IA n'est pas configuré");
    }

    const content = await this.request(apiKey, systemPrompt, userPrompt);

    try {
      return JSON.parse(content) as T;
    } catch {
      this.logger.error(`OpenRouter returned content that is not valid JSON: ${content.slice(0, 200)}`);
      throw new ServiceUnavailableException("Réponse de l'IA illisible");
    }
  }

  private async request(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    let payload: IOpenRouterResponse;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter responded with status ${response.status}`);
      }

      payload = (await response.json()) as IOpenRouterResponse;
    } catch (error) {
      this.logger.error(`OpenRouter request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new ServiceUnavailableException("Le service d'IA est indisponible");
    }

    const content = payload?.choices?.[0]?.message?.content;

    if (!content) {
      this.logger.error('OpenRouter returned an empty completion');
      throw new ServiceUnavailableException("Réponse de l'IA vide");
    }

    return content;
  }
}
