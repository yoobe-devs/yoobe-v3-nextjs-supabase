# Firecrawl Integration for Catalog Scraping

## Overview

This document describes the integration of Firecrawl with the Yoobe v3 catalog scraping system to improve data extraction from `catalog.yoobe.co`.

## What is Firecrawl?

Firecrawl is a powerful web scraping service that can handle JavaScript-heavy websites and provide clean, structured data extraction. It's particularly useful for:

- Dynamic content that loads via JavaScript
- Complex website structures
- Anti-bot protection bypass
- Clean markdown and HTML output

## Installation

Firecrawl has been installed as a dependency:

```bash
npm install @mendable/firecrawl-js
```

## Configuration

### Environment Variables

Add the following environment variable to your `.env.local` file:

```env
# Firecrawl Configuration (Optional - for improved web scraping)
# Get your API key from: https://firecrawl.dev/
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### Getting a Firecrawl API Key

1. Visit [https://firecrawl.dev/](https://firecrawl.dev/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

## How It Works

The updated `CatalogScraper` class now uses a hybrid approach:

1. **Primary Method**: Firecrawl scraping (if API key is available)
2. **Fallback Method**: Standard fetch scraping (if Firecrawl fails or is not configured)

### Scraping Process

```typescript
// 1. Try Firecrawl first
if (process.env.FIRECRAWL_API_KEY) {
  const scrapeResult = await this.firecrawl.scrapeUrl(url, {
    formats: ['markdown', 'html'],
    waitFor: 3000, // Wait 3 seconds for dynamic content
    timeout: 30000, // 30 second timeout
    onlyMainContent: true,
    removeBase64Images: true,
  })
}

// 2. Fallback to standard fetch if Firecrawl fails
const response = await fetch(url, {
  /* headers */
})
```

### Data Processing

The scraper now processes data from multiple sources:

1. **Markdown Content**: Extracted from Firecrawl for clean text parsing
2. **HTML Content**: Fallback HTML parsing for complex structures
3. **Deduplication**: Removes duplicate products found in both formats

## Benefits

### Improved Data Quality

- Better handling of dynamic content
- Cleaner text extraction from markdown
- More reliable product information parsing

### Enhanced Reliability

- Automatic fallback to standard scraping
- Better error handling and logging
- Reduced dependency on website structure changes

### Performance

- Faster processing of complex pages
- Better handling of JavaScript-heavy sites
- Reduced parsing errors

## Testing

Run the test script to verify Firecrawl integration:

```bash
node test-firecrawl-scraper.js
```

This will test:

- Single page scraping
- Category-specific scraping
- Data extraction quality
- Error handling

## API Usage

### Basic Scraping

```typescript
import { CatalogScraper } from '@/lib/services/catalog-scraper'

const scraper = new CatalogScraper()

// Scrape a specific page
const products = await scraper.scrapeProducts(1)

// Scrape a specific category
const categoryProducts = await scraper.scrapeProducts(1, '4')
```

### Bulk Import

```typescript
// Import all categories
const results = await scraper.scrapeAllCategories()

// Integrate to database
for (const result of results) {
  const integrationResult = await scraper.integrateToDatabase(result.products)
  console.log(`Imported ${integrationResult.success} products`)
}
```

## Monitoring and Logging

The scraper provides detailed logging:

- 🔥 Firecrawl usage indicators
- ✅ Success confirmations
- ⚠️ Warning messages
- ❌ Error details
- 📊 Statistics and counts

## Troubleshooting

### Common Issues

1. **No API Key**: The scraper will automatically fall back to standard scraping
2. **API Rate Limits**: Firecrawl has usage limits based on your plan
3. **Timeout Issues**: Adjust the `timeout` parameter in the scraping options
4. **Parsing Errors**: Check the website structure and update parsing patterns

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## Cost Considerations

- Firecrawl is a paid service with usage-based pricing
- Consider your scraping volume when choosing a plan
- The fallback method ensures functionality even without Firecrawl

## Future Enhancements

Potential improvements for the Firecrawl integration:

1. **Caching**: Implement result caching to reduce API calls
2. **Batch Processing**: Use Firecrawl's batch API for multiple URLs
3. **Custom Schemas**: Define specific data extraction schemas
4. **Monitoring**: Add usage tracking and cost monitoring
5. **A/B Testing**: Compare Firecrawl vs standard scraping results

## Support

For issues related to:

- **Firecrawl Service**: Contact [Firecrawl Support](https://firecrawl.dev/support)
- **Integration Issues**: Check the project documentation or create an issue
- **API Usage**: Refer to [Firecrawl Documentation](https://docs.firecrawl.dev/)

---

_Last updated: $(date)_
_Version: 3.3.0_
