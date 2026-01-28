import './globals.css';

export const metadata = {
  title: 'MentionMatch Dashboard | BuddyHelps',
  description: 'Review and respond to B2B writer requests from MentionMatch',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
