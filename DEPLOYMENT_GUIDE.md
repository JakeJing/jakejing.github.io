# Deployment Guide: World Languages Map Visualization

## What's Been Done

1. **Created Jekyll Post**: Added `_posts/2025-01-27-world-languages-map-visualization.md` with proper front matter
2. **Rendered Quarto Document**: Converted `language-map.qmd` to `language-map.html` using Quarto
3. **Copied Interactive Files**: Moved the HTML file and dependencies to `_site/posts/`
4. **Updated Paths**: Fixed the iframe and link paths in the Jekyll post
5. **Tested Locally**: Verified the site builds and serves correctly

## Files Added/Modified

### New Files:
- `_posts/2025-01-27-world-languages-map-visualization.md` - The main Jekyll post
- `_site/posts/language-map.html` - The interactive visualization
- `_site/posts/language-map_files/` - Dependencies for the visualization
- `_site/posts/contemporary_sf.rds` - Data file
- `_site/posts/traditional_sf.rds` - Data file

### Modified Files:
- None (only new files were created)

## How to Deploy to GitHub Pages

### Option 1: Manual Deployment (Recommended)

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add World Languages Map Visualization post"
   git push origin master
   ```

2. **GitHub Pages will automatically build** your site from the `master` branch.

3. **Your post will be available at**:
   - Main post: `https://jakejing.github.io/posts/2025/01/world-languages-map-visualization/`
   - Interactive visualization: `https://jakejing.github.io/posts/language-map.html`

### Option 2: Using GitHub Actions (Advanced)

If you want automated deployment, you can create a GitHub Actions workflow:

1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ master ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v2
       - name: Set up Ruby
         uses: ruby/setup-ruby@v1
         with:
           ruby-version: 3.0
       - name: Install dependencies
         run: |
           gem install bundler
           bundle install
       - name: Build site
         run: bundle exec jekyll build
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./_site
   ```

## Post Features

The new post includes:

1. **Interactive World Maps**: Global views of traditional and contemporary speaker areas
2. **Major Language Families**: Detailed maps for 8 major language families
3. **Statistics**: Interactive bar charts showing language distribution
4. **Searchable Database**: Complete language tables for both datasets
5. **Embedded Visualization**: The interactive map is embedded directly in the post

## Technical Details

- **Quarto Document**: The original `language-map.qmd` file contains R code for creating interactive maps
- **Rendered HTML**: The Quarto document was rendered to standalone HTML with all dependencies
- **Jekyll Integration**: The HTML is embedded in the Jekyll post using an iframe
- **Data Files**: The `.rds` files contain the processed spatial data for the visualizations

## Troubleshooting

### If the interactive visualization doesn't load:
1. Check that `language-map.html` and `language-map_files/` are in `_site/posts/`
2. Verify the iframe path in the Jekyll post is correct
3. Check browser console for any JavaScript errors

### If the site doesn't build:
1. Run `bundle exec jekyll build` locally to check for errors
2. Ensure all required gems are installed: `bundle install`
3. Check that the front matter in the post is valid

### If you need to update the visualization:
1. Modify the `language-map.qmd` file
2. Re-render with: `quarto render language-map.qmd --to html`
3. Copy the new files to `_site/posts/`
4. Rebuild the site: `bundle exec jekyll build`

## Next Steps

1. **Deploy**: Push your changes to GitHub
2. **Test**: Visit your site to ensure everything works
3. **Share**: The post will be automatically included in your blog's post list
4. **Update**: You can modify the visualization by editing the Quarto file and re-rendering

Your World Languages Map Visualization is now ready for deployment! 🗺️
