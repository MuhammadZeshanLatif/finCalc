<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>FinanceCalculator Sitemap</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 16px; color: #4b5563; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; font-size: 13px; }
          th { background: #f9fafb; text-align: left; }
          tr:nth-child(even) { background: #fcfcfd; }
          a { color: #0f5fd6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .small { font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>FinanceCalculator Sitemap</h1>
        <p>
          URLs:
          <strong><xsl:value-of select="count(s:urlset/s:url)" /></strong>
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Freq</th>
              <th>Priority</th>
              <th>Alternates</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td>
                  <a href="{s:loc}">
                    <xsl:value-of select="s:loc" />
                  </a>
                </td>
                <td><xsl:value-of select="s:lastmod" /></td>
                <td><xsl:value-of select="s:changefreq" /></td>
                <td><xsl:value-of select="s:priority" /></td>
                <td class="small">
                  <xsl:for-each select="xhtml:link">
                    <div>
                      <xsl:value-of select="@hreflang" />:
                      <a href="{@href}">
                        <xsl:value-of select="@href" />
                      </a>
                    </div>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
