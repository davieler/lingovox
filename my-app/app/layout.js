export const metadata = {
  title: 'My page',
  description: 'My page description',
  keywords: 'my,page,keywords',
}

export default function RootLayout({ children }) {
  return (
      <html lang="en">
          <head>
              <title>{metadata.title}</title>
              <meta name="description" content={metadata.description} />
              <meta name="keywords" content={metadata.keywords} />
          </head>
          <body>
              {children}
          </body>
      </html>
  );
}
