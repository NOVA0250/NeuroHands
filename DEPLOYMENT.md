# NeuroHands Deployment Guide

## Vercel Deployment (Frontend)

### Prerequisites
- GitHub repository set up
- Vercel account (vercel.com)

### Steps

1. **Connect GitHub**
   - Go to vercel.com and sign in
   - Click "New Project"
   - Select your NeuroHands repository

2. **Configure Build**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./`

3. **Environment Variables** (if needed)
   - None required for basic setup

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Performance Optimization

### Build
```bash
npm run build
```

### Output
- HTML: ~15KB
- CSS: ~30KB (Tailwind)
- JS: ~300KB (React + MediaPipe)
- Total: ~350KB gzipped

### Caching
Vercel automatically caches:
- Static assets (CDN)
- Service workers (offline support)

## Monitoring

1. **Analytics**: Vercel dashboard
2. **Errors**: Check Vercel logs
3. **Performance**: Lighthouse scores

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Clear cache: `npm ci` && `npm run build`

### Deployment Fails
- Check Node version (18+)
- Verify all dependencies installed
- Check environment variables

### Camera Not Working
- Requires HTTPS (Vercel provides this)
- Browser must allow camera access
- Check browser console for errors

## Local Testing

```bash
# Production build
npm run build
npm run preview

# Open http://localhost:5173
```
