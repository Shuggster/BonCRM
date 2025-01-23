# AI Services Business Account Setup

## Required Business Accounts

### 1. OpenAI
- Current: Personal API key
- Need: Business account
- Features needed:
  - GPT-4
  - DALL-E
  - Fine-tuning capability
- Priority: High

### 2. Anthropic
- Current: Personal API key
- Need: Business account
- Features needed:
  - Claude
- Priority: Medium

### 3. Stability AI
- Current: Personal API key
- Need: Business account
- Features needed:
  - Stable Diffusion
- Priority: Medium

### 4. Hugging Face
- Current: Personal API key
- Need: Business account
- Features needed:
  - Model hosting
  - Inference API
- Priority: Low

## Steps for Each Service
1. Register business account with company details
2. Set up business billing
3. Generate new API keys
4. Store credentials in Supabase technical_assets table
5. Update environment variables
6. Test all integrations

## Security Considerations
- Store all API keys in Supabase technical_assets table (encrypted)
- Use environment variables for local development
- Regular key rotation policy
- Usage monitoring and alerts
- Rate limiting implementation

## Documentation Requirements
- API key management procedures
- Usage guidelines
- Emergency contact information
- Backup procedures
- Cost monitoring
