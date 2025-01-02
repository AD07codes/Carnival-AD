# Carnival-AD Free Fire Tournaments

A platform for organizing and participating in Free Fire tournaments.

## Deployment Steps

1. Fork this repository to your GitHub account

2. Sign up on Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

3. Import your repository:
   - Click "New Project"
   - Select the forked repository
   - Configure project settings

4. Configure Environment Variables:
   Add the following environment variables in Vercel:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Deploy:
   - Click "Deploy"
   - Wait for the build to complete

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
