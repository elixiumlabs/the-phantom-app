-- Add OpenRouter as a selectable LLM provider.
alter type llm_provider_type add value if not exists 'openrouter';
