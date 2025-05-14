# Environment Setup Guide

This guide explains how to manage environment variables and secrets for the Playwright test suite across different environments.

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update values in `.env` with your local development settings

## GitHub Actions Configuration

The workflow automatically handles environment variables using two sources:
1. GitHub Variables (for non-sensitive data)
2. GitHub Secrets (for sensitive data)

### Setting up GitHub Variables

1. Go to your repository settings
2. Navigate to `Settings > Variables > Actions`
3. Add variables that aren't sensitive:
   ```
   BASE_URL=https://staging.example.com
   API_URL=https://api-staging.example.com
   VIEWPORT_WIDTH=1280
   VIEWPORT_HEIGHT=720
   ```

### Setting up GitHub Secrets

1. Go to your repository settings
2. Navigate to `Settings > Secrets and variables > Actions`
3. Add sensitive information:
   ```
   AUTH_USERNAME=test-user
   AUTH_PASSWORD=secure-password
   API_KEY=your-api-key
   API_SECRET=your-api-secret
   SLACK_WEBHOOK_URL=your-slack-webhook
   ```

### How It Works

The GitHub Actions workflow uses PowerShell to automatically map all variables and secrets to environment variables:

```yaml
- name: Set Environment Variables from Vars
  shell: pwsh
  run: |
    $vars = @"
    ${{ toJson(vars) }}
    "@

    $jsonvars = $vars | ConvertFrom-Json
    foreach($object_properties in $jsonvars.PsObject.Properties)
    {
        echo "$($object_properties.Name.Replace('_','__'))=$($object_properties.Value)" | Out-File -FilePath $Env:GITHUB_ENV -Encoding utf8 -Append
    }

- name: Set Environment Secrets from Secrets
  shell: pwsh
  run: |
    $secrets = @"
    ${{ toJson(secrets) }}
    "@

    $jsonsecrets = $secrets | ConvertFrom-Json
    foreach($object_properties in $jsonsecrets.PsObject.Properties)
    {
        echo "$($object_properties.Name.Replace('_','__'))=$($object_properties.Value)" | Out-File -FilePath $Env:GITHUB_ENV -Encoding utf8 -Append
    }
```

This approach:
- Automatically maps all GitHub Variables and Secrets to environment variables
- Handles variable name transformations (replacing single underscores with double underscores)
- Makes variables available to all steps in the workflow

## Environment-Specific Configuration

### Test Environment (.env.test)
- Used for CI/CD pipelines
- Values are overridden by GitHub Variables and Secrets
- Provides fallback values for local testing

### Production Environment
- Never commit production credentials
- Always use GitHub Secrets for sensitive data
- Use GitHub Variables for non-sensitive configuration

## Best Practices

1. **Secret Management**
   - Never commit sensitive data to the repository
   - Use GitHub Secrets for all credentials
   - Rotate secrets regularly

2. **Variable Naming**
   - Use UPPER_CASE for environment variables
   - Use descriptive names (e.g., `AUTH_USERNAME` instead of `USER`)
   - Prefix related variables (e.g., `API_KEY`, `API_SECRET`)

3. **Environment Separation**
   - Keep different environments isolated
   - Use different variables for dev/staging/prod
   - Document required variables

4. **Default Values**
   - Provide sensible defaults in `.env.example`
   - Document required vs optional variables
   - Include validation in the config

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```typescript
   // Add validation in test-config.ts
   if (!process.env.API_KEY) {
     throw new Error('API_KEY is required');
   }
   ```

2. **Invalid Secret Format**
   - Check secret naming (should match environment variable names)
   - Verify secret values are properly formatted
   - Check for extra whitespace in secrets

3. **GitHub Actions Access**
   - Ensure proper permissions are set
   - Check organization policies
   - Verify workflow has access to secrets

### Debugging

1. **Local Environment**
   ```bash
   # Print all environment variables
   node -e "console.log(process.env)"
   ```

2. **GitHub Actions**
   - Use workflow debug logs
   - Add environment variable checks:
   ```yaml
   - name: Debug Environment
     run: |
       echo "Checking environment variables..."
       env | grep -i "API_"  # Lists all API-related variables
   ```

## Security Considerations

1. **Secret Exposure Prevention**
   - Never log sensitive values
   - Mask secrets in GitHub Actions logs
   - Use secret scanning tools

2. **Access Control**
   - Limit secret access to required workflows
   - Use environment protection rules
   - Implement secret rotation

3. **Audit Trail**
   - Monitor secret usage
   - Review access logs
   - Track environment changes

## Additional Resources

1. [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
2. [Environment Variables in Playwright](https://playwright.dev/docs/test-parameterize#env-files)
3. [GitHub Environment Protection Rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
