export const metadata = {
  title: 'Orcred Email Tracker',
  description: 'Internal email tracking dashboard'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}